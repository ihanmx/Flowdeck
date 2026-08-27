import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertColumnInOrg(
    organizationId: string,
    projectId: string,
    boardId: string,
    columnId: string,
  ) {
    const column = await this.prisma.column.findFirst({
      where: {
        id: columnId,
        boardId,
        board: {
          id: boardId,
          projectId,
          project: {
            organizationId,
          },
        },
      },
      select: { id: true },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
  }

  async create(
    organizationId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    dto: CreateTaskDto,
  ) {
    await this.assertColumnInOrg(organizationId, projectId, boardId, columnId);
    const count = await this.prisma.task.count({ where: { columnId } });
    return this.prisma.task.create({
      data: {
        columnId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
        position: count,
      },
    });
  }
  async findAll(
    organizationId: string,
    projectId: string,
    boardId: string,
    columnId: string,
  ) {
    await this.assertColumnInOrg(organizationId, projectId, boardId, columnId);
    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
      include: {
        assignee: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async update(
    organizationId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertColumnInOrg(organizationId, projectId, boardId, columnId);
    const result = await this.prisma.task.updateMany({
      where: { id: taskId, columnId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
    if (result.count === 0) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.task.findUnique({ where: { id: taskId } });
  }

  async remove(
    organizationId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    taskId: string,
  ) {
    await this.assertColumnInOrg(organizationId, projectId, boardId, columnId);
    const result = await this.prisma.task.deleteMany({
      where: { id: taskId, columnId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Task not found');
    }
    return { success: true };
  }

  async move(
    organizationId: string,
    projectId: string,
    boardId: string,
    sourceColumnId: string,
    taskId: string,
    dto: MoveTaskDto,
  ) {
    //check that both columns exist and belong to the same board, project, and organization
    await this.assertColumnInOrg(
      organizationId,
      projectId,
      boardId,
      sourceColumnId,
    );
    await this.assertColumnInOrg(
      organizationId,
      projectId,
      boardId,
      dto.targetColumnId,
    );

    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id: taskId, columnId: sourceColumnId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      //we need to use the position to guarantee the order of the tasks because the columns id cant be used alone because it cant return tasks in order the smae Idea we cant relay on DB insertion order

      const from = task.position;
      const to = dto.targetPosition;
      const sameColumn = sourceColumnId === dto.targetColumnId;
      if (sameColumn) {
        if (from === to) {
          return task; //keep the task in the same position if the source and target positions are the same
        }

        if (to > from) {
          //move down the task in the same column
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              position: {
                gt: from,
                lte: to,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        } else if (to < from) {
          //move up the task in the same column
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              position: {
                gte: to,
                lt: from,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        }
      } else {
        //cross column move
        // 1. close the gap in the source column
        await tx.task.updateMany({
          where: { columnId: sourceColumnId, position: { gt: from } },
          data: { position: { decrement: 1 } },
        });
        // 2. open a gap in the target column
        await tx.task.updateMany({
          where: { columnId: dto.targetColumnId, position: { gte: to } },
          data: { position: { increment: 1 } },
        });
      }

      // 3. place the task in its new home
      return tx.task.update({
        where: { id: taskId },
        data: { columnId: dto.targetColumnId, position: to },
      });
    });
  }
}
