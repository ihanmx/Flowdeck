import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { AcceptInvitationController } from './accept-invitation.controller';
@Module({
  controllers: [InvitationsController, AcceptInvitationController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
