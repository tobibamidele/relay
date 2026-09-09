import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import { APIKeyService } from "./api-key.service.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";

@UseGuards(AuthGuard)
@Controller('api-keys')
export class APIKeysController {
  constructor(private readonly apiKeyService: APIKeyService) {}
  @Get()
  async findAll(@Req() request: AuthenticatedRequest) {
    return this.apiKeyService.listKeysByProjectID(request.project.id)
  }
}
