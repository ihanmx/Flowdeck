import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    //A slug is a URL-friendly version of a name — lowercase, no spaces, no special characters, words joined by dashes.
    const slug = await this.generateUniqueSlug(dto.name);
    //transaction It runs several database operations as one atomic unit.
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: dto.name, slug },
      });

      await tx.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role: 'OWNER',
        },
      });
      return organization;
    });
  }

  async findAllForUser(userId: string) {
    // "orgs where at least one membership belongs to this user"
    return this.prisma.organization.findMany({
      where: { memberships: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMembers(organizationId: string) {
    return this.prisma.membership.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  //--helpers

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → dashes
      .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name) || 'org';
    let slug = base;
    let counter = 1;

    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}

// What it does	Example
// include	add related records (uses all their fields unless you nest a select)	include: { user: true }
// select	return only listed fields (of the main record and/or relations)	select: { id: true, email: true }
