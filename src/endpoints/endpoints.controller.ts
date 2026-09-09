import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { EndpointsService } from "./endpoints.service.js";
import { CreateEndpointDto } from "./dto/create-endpoint-dto.js";
import { UpdateEndpointDto } from "./dto/update-endpoint-dto.js";

@UseGuards(AuthGuard)
@Controller("endpoints")
export class EndpointController {
  constructor(private readonly endpointService: EndpointsService) {}

  @Get()
  async getAllEndpoints(@Req() request: AuthenticatedRequest) {
    return {
      data: await this.endpointService.findEndpointsByProjectID(request.project.id)
    }
  }

  @Get(":id")
  async getEndpointByID(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return await this.endpointService.findEndpointsByEndpointID(id, request.project.id)
  }

  @Post()
  async createEndpoint(@Req() request: AuthenticatedRequest, @Body() body: CreateEndpointDto) {
    const endpoint = await this.endpointService.createEndpoint(
      request.project.id,
      body.url,
      body.events,
      body.enabled ?? true,
    )

    return endpoint;
  }

  @Patch(":endpointId")
  async updateEndpoint(@Req() request: AuthenticatedRequest, @Param('endpointId') endpointId: string, @Body() body: UpdateEndpointDto) {
    const result = await this.endpointService.updateEndpointByID(
      endpointId,
      request.project.id,
      body
    )

    return result;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEndpointByID(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.endpointService.deleteEndpointByID(id, request.project.id)
  }
}
