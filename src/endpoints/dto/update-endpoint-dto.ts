import { ArrayNotEmpty, IsArray, IsBoolean, IsString } from "class-validator";

export class UpdateEndpointDto {
    @IsString()
    url?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    events?: string[];

    @IsBoolean()
    enabled?: boolean;
}
