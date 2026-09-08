import { Module } from "@nestjs/common";
import { ProjectController } from "./projects.controller.js";
import { ProjectsService } from "./projects.service.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectController],
  providers: [ProjectsService],
})

export class ProjectsModule {}
