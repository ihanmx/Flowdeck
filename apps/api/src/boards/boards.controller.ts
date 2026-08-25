import {
  Param,
  Post,
  UseGuards,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgRolesGuard } from '../organizations/guards/org-roles.guard';
import { Roles } from '../organizations/decorators/roles.decorator';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@UseGuards(JwtAuthGuard, OrgRolesGuard)
@Controller('organizations/:id/projects/:projectId/boards')
export class BoardsController {
  constructor(private readonly boards: BoardsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boards.create(organizationId, projectId, dto);
  }
  @Get()
  findAll(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.boards.findAll(organizationId, projectId);
  }
  @Get(':boardId')
  findOne(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
  ) {
    return this.boards.findOne(organizationId, projectId, boardId);
  }

  @Patch(':boardId')
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boards.update(organizationId, projectId, boardId, dto);
  }
  @Delete(':boardId')
  @Roles('OWNER', 'ADMIN')
  remove(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
  ) {
    return this.boards.remove(organizationId, projectId, boardId);
  }
}
