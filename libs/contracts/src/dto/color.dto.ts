import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';

export class ColorCreateDto {
  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @Transform(trim)
  @IsNotEmpty()
  @IsHexColor()
  hex: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ColorUpdateDto {
  @IsUUID()
  id: string;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name?: string;

  @Transform(trim)
  @IsNotEmpty()
  @IsHexColor()
  hex?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ColorResponseDto {
  id: string;
  name: string;
  hex: string;
  isActive: boolean;
}
