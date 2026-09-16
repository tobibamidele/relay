import { ArrayNotEmpty, IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";


export type SendDeliveryEndpointType = {
  id: string,
  url: string,
  secret: string,
}

export class SendDeliveryDto {
  @IsString()
  projectId: string;

  @IsString()
  eventId: string;

  @IsString()
  type: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  endpoints: SendDeliveryEndpointType[];

  @IsOptional()
  @IsString()
  idempotencyKey: string | null;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
