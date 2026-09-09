import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { EndpointsService } from "./endpoints.service.js";
import { CreateEndpointDto } from "./dto/create-endpoint-dto.js";

@UseGuards(AuthGuard)
@Controller("endpoints")
export class EndpointController {
  constructor(private readonly endpointService: EndpointsService) {}

  @Get()
  async getAllEndpoints(@Req() request: AuthenticatedRequest) {
    return this.endpointService.findEndpointsByProjectID(request.project.id)
  }

  @Post()
  async createEndpoint(@Req() request: AuthenticatedRequest, @Body() body: CreateEndpointDto) {
    const endpoint = await this.endpointService.createEndpoint(
      request.project.id,
      body.url,
      body.events,
      body.enabled ?? true,
    )

    return {
      "messasge": "endpoint created successfully",
      "id": endpoint.id,
      "projectId": endpoint.projectId,
      "enabled": endpoint.enabled,
    };
  }

  @Delete(":id")
  async deleteEndpointByID(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.endpointService.deleteEndpointByID(id, request.project.id)
    return {
      "message": "endpoint deleted successfully!",
    }
  }
}
