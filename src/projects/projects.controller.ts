import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project-dto.js";
import { ProjectsService } from "./projects.service.js";

@Controller("projects")
export class ProjectController {
  // inject the service through the constructor
  constructor(private readonly projectsService: ProjectsService) {}
  @Get()
  async listAll() {
    return await this.projectsService.findAll();
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
