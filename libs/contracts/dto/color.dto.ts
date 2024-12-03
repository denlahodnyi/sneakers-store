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
import { PartialType } from '@nestjs/mapped-types';

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

export class ColorUpdateDto extends PartialType(ColorCreateDto) {
  @IsUUID()
  id: string;
}

export class ColorResponseDto {
  id: string;
  name: string;
  hex: string;
  isActive: boolean;
}
