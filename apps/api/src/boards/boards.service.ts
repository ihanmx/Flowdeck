import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'];
@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  // Verifies the project exists AND belongs to this org. Reused by every method.
  private async assertProjectInOrg(organizationId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  async create(organizationId: string, projectId: string, dto: CreateBoardDto) {
    await this.assertProjectInOrg(organizationId, projectId);
    return this.prisma.board.create({
      data: {
        projectId,
        name: dto.name,
        // Nested create: board + its columns are inserted atomically
        columns: {
          create: DEFAULT_COLUMNS.map((name, position) => ({ name, position })),
        },
      },
    });
  }

  async findAll(organizationId: string, projectId: string) {
    await this.assertProjectInOrg(organizationId, projectId);
    return this.prisma.board.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(organizationId: string, projectId: string, boardId: string) {
    await this.assertProjectInOrg(organizationId, projectId);
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, projectId },
      // Everything the board screen needs in ONE request: columns → tasks → assignee fix 1+N req issue
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignee: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async update(
    organizationId: string,
    projectId: string,
    boardId: string,
    dto: UpdateBoardDto,
  ) {
    await this.assertProjectInOrg(organizationId, projectId);
    const result = await this.prisma.board.updateMany({
      where: { id: boardId, projectId },
      data: dto,
    });
    if (result.count === 0) {
      throw new NotFoundException('Board not found');
    }
    return this.findOne(organizationId, projectId, boardId);
  }
  async remove(organizationId: string, projectId: string, boardId: string) {
    await this.assertProjectInOrg(organizationId, projectId);
    const result = await this.prisma.board.deleteMany({
      where: { id: boardId, projectId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Board not found');
    }
    return { success: true };
  }
}
