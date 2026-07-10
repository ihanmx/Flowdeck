import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrgRolesGuard } from './guards/org-roles.guard'; // ← add

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrganizationDto) {
    return this.organizations.create(user.id, dto.name);
  }

  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.organizations.findAllForUser(user.id);
  }

  @Get(':id/members')
  @UseGuards(OrgRolesGuard)
  findMembers(@Param('id') id: string) {
    return this.organizations.findMembers(id);
  }
}
