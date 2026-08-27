import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgRolesGuard } from '../organizations/guards/org-roles.guard';
import { Roles } from '../organizations/decorators/roles.decorator';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@UseGuards(JwtAuthGuard, OrgRolesGuard)
@Controller('organizations/:id/projects/:projectId/boards/:boardId/columns')
export class ColumnsController {
  constructor(private readonly columns: ColumnsService) {}

  @Post()
  @Roles('ADMIN', 'OWNER')
  create(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columns.create(organizationId, projectId, boardId, dto);
  }

  @Get()
  findAll(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
  ) {
    return this.columns.findAll(organizationId, projectId, boardId);
  }

  @Patch(':columnId')
  @Roles('ADMIN', 'OWNER')
  update(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columns.update(
      organizationId,
      projectId,
      boardId,
      columnId,
      dto,
    );
  }

  @Delete(':columnId')
  @Roles('OWNER', 'ADMIN')
  remove(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.columns.remove(organizationId, projectId, boardId, columnId);
  }
}
