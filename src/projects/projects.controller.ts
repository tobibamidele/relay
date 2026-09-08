import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project-dto.js";
import { ProjectsService } from "./projects.service.js";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";

@Controller("projects")
export class ProjectController {
  // inject the service through the constructor
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getProject(@Req() request: AuthenticatedRequest) {
    return await this.projectsService.findByID(request.project.id);
  }

  @Post()
  async createProject(@Body() body: CreateProjectDto) {
    const { id, name, apiKey } = await this.projectsService.createProject(body.name);
    return {
      id,
      name,
      apiKey,
    }
  }
}
