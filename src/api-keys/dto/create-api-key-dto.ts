import { IsString } from "class-validator";

export class CreateAPIKeyDto {
  @IsString()
  name: string;
}
