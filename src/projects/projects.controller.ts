import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project-dto.js";
import { ProjectsService } from "./projects.service.js";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";

@Controller("projects")
export class ProjectController {
  // inject the service through the constructor
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard)
  @Get(":projectId")
  async getProject(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return await this.projectsService.findByID(projectId);
  }

  @Post()
  async createProject(@Body() body: CreateProjectDto) {
    return await this.projectsService.createProject(body.name);
  }
}
