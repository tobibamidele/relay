import { IsOptional, IsString } from "class-validator";
import type { DeliveryStatus } from "../../database/schema.js";

export class GetDeliveriesDto {
  @IsOptional()
  @IsString()
  status?: DeliveryStatus;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  endpointId?: string;
}
