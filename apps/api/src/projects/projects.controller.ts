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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@UseGuards(JwtAuthGuard, OrgRolesGuard)
@Controller('organizations/:id/projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Param('id') organizationId: string, @Body() dto: CreateProjectDto) {
    return this.projects.create(organizationId, dto);
  }

  @Get()
  findAll(@Param('id') organizationId: string) {
    return this.projects.findAll(organizationId);
  }

  @Get(':projectId')
  findOne(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projects.findOne(organizationId, projectId);
  }

  @Patch(':projectId')
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(organizationId, projectId, dto);
  }

  @Delete(':projectId')
  @Roles('OWNER', 'ADMIN')
  remove(
    @Param('id') organizationId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projects.remove(organizationId, projectId);
  }
}
