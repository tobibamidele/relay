import { ArrayNotEmpty, IsArray, IsNotEmpty, IsObject, IsString } from "class-validator";


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
  endpointIds: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  endpoints: SendDeliveryEndpointType[];

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
