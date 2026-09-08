import { ArrayNotEmpty, IsArray, IsBoolean, IsString } from "class-validator";

export class CreateEndpointDto {
    @IsString()
    url: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    events: string[];

    @IsBoolean()
    enabled?: boolean;
}
