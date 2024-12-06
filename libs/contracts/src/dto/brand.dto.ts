import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';

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
  @IsUUID()
  id: string;

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
  id: string;
  name: string;
  iconUrl: string | null;
  isActive: boolean;
}
