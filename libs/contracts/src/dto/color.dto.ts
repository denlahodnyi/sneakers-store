import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { booleanString, trim } from './custom-transformers.js';

export class ColorQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(booleanString)
  active?: boolean;
}

export class ColorCreateDto {
  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsNotEmpty() // TODO: add validation
  hex: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ColorUpdateDto {
  @IsInt()
  id: number;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name?: string;

  @IsNotEmpty()
  hex?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ColorResponseDto {
  id: number;
  name: string;
  hex: string[];
  isActive: boolean;
}
