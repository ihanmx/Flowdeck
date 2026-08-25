import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { OrgRolesGuard } from '../organizations/guards/org-roles.guard';
import { Roles } from '../organizations/decorators/roles.decorator';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@UseGuards(JwtAuthGuard)
@Controller('organizations/:id/invitations')
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post()
  @UseGuards(OrgRolesGuard)
  @Roles('OWNER', 'ADMIN')
  create(
    @Param('id') organizationId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitations.create(organizationId, user.id, dto);
  }
}
