import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class GetEventsDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;

  @IsOptional()
  @IsString()
  cursor?: string;
}
