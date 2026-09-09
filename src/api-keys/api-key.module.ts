import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { APIKeysController } from "./api-key.controller.js";
import { AuthService } from "../auth/auth.service.js";
import { APIKeyService } from "./api-key.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [APIKeysController],
  providers: [AuthService, APIKeyService],
})

export class APIKeysModule {}
