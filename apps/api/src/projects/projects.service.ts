import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateProjectDto) {
    return await this.prisma.project.create({
      data: { organizationId, name: dto.name, description: dto.description },
    });
  }

  async findAll(organizationId: string) {
    return await this.prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    organizationId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    await this.findOne(organizationId, projectId);
    return await this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async remove(organizationId: string, projectId: string) {
    await this.findOne(organizationId, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
    return { success: true };
  }
}
