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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@UseGuards(JwtAuthGuard, OrgRolesGuard)
@Controller(
  'organizations/:id/projects/:projectId/boards/:boardId/columns/:columnId/tasks',
)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(organizationId, projectId, boardId, columnId, dto);
  }

  @Get()
  findAll(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.tasks.findAll(organizationId, projectId, boardId, columnId);
  }

  @Patch(':taskId')
  update(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(
      organizationId,
      projectId,
      boardId,
      columnId,
      taskId,
      dto,
    );
  }

  @Patch(':taskId/move')
  move(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasks.move(
      organizationId,
      projectId,
      boardId,
      columnId,
      taskId,
      dto,
    );
  }

  @Delete(':taskId')
  remove(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasks.remove(
      organizationId,
      projectId,
      boardId,
      columnId,
      taskId,
    );
  }
}
