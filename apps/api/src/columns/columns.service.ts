import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  // Walk Board -> Project -> Org
  // Walk Board -> Project -> Org to confirm this board belongs to the tenant.
  private async assertBoardInOrg(
    organizationId: string,
    projectId: string,
    boardId: string,
  ) {
    const board = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        projectId,
        project: { organizationId }, // relation filter up the chain
      },
      select: { id: true },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
  }

  async create(
    organizationId: string,
    projectId: string,
    boardId: string,
    dto: CreateColumnDto,
  ) {
    await this.assertBoardInOrg(organizationId, projectId, boardId);

    // New column must go to the end
    const count = await this.prisma.column.count({ where: { boardId } });

    return this.prisma.column.create({
      data: { boardId, name: dto.name, position: count },
    });
  }

  async findAll(organizationId: string, projectId: string, boardId: string) {
    await this.assertBoardInOrg(organizationId, projectId, boardId);

    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });
  }

  async update(
    organizationId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    dto: UpdateColumnDto,
  ) {
    await this.assertBoardInOrg(organizationId, projectId, boardId);

    const result = await this.prisma.column.updateMany({
      where: { id: columnId, boardId },
      data: dto,
    });

    if (result.count === 0) {
      throw new NotFoundException('Column not found');
    }
    return this.prisma.column.findUnique({ where: { id: columnId } });
  }

  async remove(
    organizationId: string,
    projectId: string,
    boardId: string,
    columnId: string,
  ) {
    await this.assertBoardInOrg(organizationId, projectId, boardId);
    const result = await this.prisma.column.deleteMany({
      where: { id: columnId, boardId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Column not found');
    }
    return { success: true };
  }
}
