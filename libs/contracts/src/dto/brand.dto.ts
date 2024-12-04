import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';
import { PartialType } from '@nestjs/mapped-types';

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

export class BrandUpdateDto extends PartialType(BrandCreateDto) {
  @IsUUID()
  id: string;
}

export class BrandResponseDto {
  id: string;
  name: string;
  iconUrl: string | null;
  isActive: boolean;
}
