import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import { APIKeyService } from "./api-key.service.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { CreateAPIKeyDto } from "./dto/create-api-key-dto.js";
import { request } from "http";

@UseGuards(AuthGuard)
@Controller('api-keys')
export class APIKeysController {
  constructor(private readonly apiKeyService: APIKeyService) {}

  @Get()
  async findAll(@Req() request: AuthenticatedRequest) {
    return { 
      data: await this.apiKeyService.listKeysByProjectID(request.project.id) 
    }
  }

  @Post()
  async createAPIKey(@Req() request: AuthenticatedRequest, @Body() body: CreateAPIKeyDto) {
    return await this.apiKeyService.createAPIKey(
      body.name,
      request.project.id,
    )
  }

  @Post(":keyId/revoke")
  async revokeAPIKey(@Req() request: AuthenticatedRequest, @Param("keyId") keyId: string) {
    const revokedKey = await this.apiKeyService.revokeAPIKey(keyId, request.project.id)    
    return {
      id: revokedKey.id,
      revokedAt: revokedKey.revokedAt,
    }
  }
}
