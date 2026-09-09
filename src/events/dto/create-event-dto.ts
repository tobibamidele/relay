import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateEventDto {
  @IsString()
  type: string;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
