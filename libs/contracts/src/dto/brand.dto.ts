import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { booleanString, trim } from './custom-transformers.js';

export class BrandQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(booleanString)
  active?: boolean;
}

export class BrandCreateDto {
  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsOptional()
  iconUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BrandUpdateDto {
  @IsInt()
  id: number;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name?: string;

  @IsOptional()
  iconUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BrandResponseDto {
  id: number;
  name: string;
  iconUrl: string | null;
  isActive: boolean;
}
