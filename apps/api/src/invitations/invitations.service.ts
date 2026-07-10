import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/enums';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
const INVITE_TTL_DAYS = 7;

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    invitedById: string,
    email: string,
    role: Role = 'MEMBER',
  ) {
    // 1. Already a member? (only if that email belongs to an existing user)
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_organizationId: { userId: existingUser.id, organizationId },
        },
      });
      if (membership) {
        throw new ConflictException(
          'This user is already a member of the organization',
        );
      }
    }

    // 2. Already a pending invite for this email + org?
    const pending = await this.prisma.invitation.findFirst({
      where: { organizationId, email, status: 'PENDING' },
    });
    if (pending) {
      throw new ConflictException(
        'An invitation is already pending for this email',
      );
    }

    // 3. Create the invitation (expires in 7 days)
    const expiresAt = new Date(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.prisma.invitation.create({
      data: { organizationId, invitedById, email, role, expiresAt },
    });
  }

  async accept(user: AuthUser, token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== 'PENDING') {
      throw new ConflictException('This invitation is no longer valid');
    }
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('This invitation has expired');
    }
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException(
        'This invitation was sent to a different email address',
      );
    }

    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'You are already a member of this organization',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return membership;
    });
  }
}
