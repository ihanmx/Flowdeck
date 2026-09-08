import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Prisma } from '../generated/prisma/client';
@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

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
    const task = await this.prisma.task.create({
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
    this.realtime.emitToBoard(boardId, `task:created`, task);
    return task;
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
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    this.realtime.emitToBoard(boardId, `task:updated`, task);
    return task;
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
    this.realtime.emitToBoard(boardId, `task:deleted`, { id: taskId });
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

    const movedTask = await this.moveWithRetry(sourceColumnId, taskId, dto);

    // Broadcast AFTER the transaction commits — everyone watching this board
    // gets the moved task live. (If the tx had rolled back, we'd never emit.)
    this.realtime.emitToBoard(boardId, 'task:moved', movedTask);
    return movedTask;
  }

  /**
   * Runs the position-shifting transaction at SERIALIZABLE isolation so that two
   * people moving tasks in the same column at the same time can never corrupt the
   * order. If Postgres detects a conflict it aborts one transaction (error P2034);
   * we simply retry it, re-reading fresh positions.
   */
  private async moveWithRetry(
    sourceColumnId: string,
    taskId: string,
    dto: MoveTaskDto,
  ) {
    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const task = await tx.task.findFirst({
              where: { id: taskId, columnId: sourceColumnId },
            });

            if (!task) {
              throw new NotFoundException('Task not found');
            }

            const from = task.position;
            const to = dto.targetPosition;
            const sameColumn = sourceColumnId === dto.targetColumnId;

            if (sameColumn) {
              if (from === to) {
                return task; // no-op: dropped back in the same spot
              }

              if (to > from) {
                // moving DOWN: shift the tasks in (from, to] up by one
                await tx.task.updateMany({
                  where: {
                    columnId: sourceColumnId,
                    position: { gt: from, lte: to },
                  },
                  data: { position: { decrement: 1 } },
                });
              } else {
                // moving UP: shift the tasks in [to, from) down by one
                await tx.task.updateMany({
                  where: {
                    columnId: sourceColumnId,
                    position: { gte: to, lt: from },
                  },
                  data: { position: { increment: 1 } },
                });
              }
            } else {
              // cross-column move
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
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        const isWriteConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';

        // A conflict with a concurrent move → retry with fresh reads.
        if (isWriteConflict && attempt < MAX_ATTEMPTS) {
          continue;
        }
        // Anything else (or out of retries) → surface the error.
        throw error;
      }
    }

    // The loop always returns or throws above; this satisfies TypeScript's
    // "not all paths return" and guards against a logic slip.
    throw new Error('Task move failed after multiple retries');
  }
}
