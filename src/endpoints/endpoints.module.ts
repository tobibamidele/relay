import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { AuthService } from "../auth/auth.service.js";
import { EndpointsService } from "./endpoints.service.js";
import { EndpointController } from "./endpoints.controller.js";

@Module({
  imports: [DatabaseModule],
  controllers: [EndpointController],
  providers: [EndpointsService, AuthService],
})

export class EndpointsModule {}
