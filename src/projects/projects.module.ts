import { Module } from "@nestjs/common";
import { ProjectController } from "./projects.controller.js";
import { ProjectsService } from "./projects.service.js";
import { DatabaseModule } from "../database/database.module.js";
import { AuthService } from "../auth/auth.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectController],
  providers: [ProjectsService, AuthService],
})

export class ProjectsModule {}
