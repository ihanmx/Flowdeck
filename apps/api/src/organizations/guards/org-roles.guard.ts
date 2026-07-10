import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import type { AuthUser } from '../../auth/decorators/current-user.decorator';
import type { MembershipModel } from '../../generated/prisma/models';

// Describe the shape of the request AFTER JwtAuthGuard has run.
interface OrgRequest extends Request<{ id: string }> {
  user: AuthUser; // attached by the JWT strategy
  membership?: MembershipModel; // we attach this below
}

@Injectable()
export class OrgRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //tool to rea
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // Tell getRequest the exact type -> no more `any`, no more errors
    const request = ctx.switchToHttp().getRequest<OrgRequest>();
    const organizationId = request.params.id;

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: request.user.id,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    request.membership = membership;

    //It searches several places for metadata in order.

    // If it finds metadata in the first place, it immediately returns it.

    // Otherwise it continues to the next target.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(), //current handler
      ctx.getClass(), //controller class
    ]);

    if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    return true;
  }
}
