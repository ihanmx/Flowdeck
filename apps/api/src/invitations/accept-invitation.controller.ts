import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { InvitationsService } from './invitations.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@UseGuards(JwtAuthGuard)
@Controller('invitations') // ← different prefix
export class AcceptInvitationController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post('accept') // → POST /invitations/accept ✅
  @HttpCode(HttpStatus.OK)
  accept(@CurrentUser() user: AuthUser, @Body() dto: AcceptInvitationDto) {
    return this.invitations.accept(user, dto);
  }

  @Get(':token') // → GET /invitations/:token
  findOne(@Param('token') token: string) {
    return this.invitations.findByToken(token);
  }
}
