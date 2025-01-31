import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { booleanString, trim } from './custom-transformers.js';

export const SizeSystem = {
  EU: 'EU',
  US: 'US',
} as const;

export type SizeSystem = (typeof SizeSystem)[keyof typeof SizeSystem];

export class SizeQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(booleanString)
  active?: boolean;
}

export class SizeCreateDto {
  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  size: string;

  @IsOptional()
  @IsEnum(SizeSystem)
  system?: SizeSystem | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SizeUpdateDto {
  @IsInt()
  id: number;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  size?: string;

  @IsOptional()
  @IsEnum(SizeSystem)
  system?: SizeSystem | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SizeResponseDto {
  id: number;
  size: string;
  system: null | SizeSystem;
  isActive: boolean;
}
