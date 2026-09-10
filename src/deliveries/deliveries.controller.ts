import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { DeliveryService } from "./deliveries.service.js";
import { AuthGuard } from "../auth/guards/authentication.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { GetDeliveriesDto } from "./dto/get-deliveries-dto.js";

@UseGuards(AuthGuard)
@Controller('deliveries')
export class  DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async findAll(@Req() request: AuthenticatedRequest, @Query() query: GetDeliveriesDto) {
    return {
      data: await this.deliveryService.findAll(request.project.id, query)
    }
  }

  @Get(":deliveryId")
  async findDeliveryByID(@Req() request: AuthenticatedRequest, @Param("deliveryId") deliveryId: string) {
    return await this.deliveryService.getDeliveryByID(deliveryId, request.project.id)
  }
}
