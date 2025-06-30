import { IsString, IsNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class McpToolArgumentsDto {
  @IsString()
  @IsNotEmpty()
  city: string;
}

export class McpToolRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => McpToolArgumentsDto)
  arguments: McpToolArgumentsDto;
} 