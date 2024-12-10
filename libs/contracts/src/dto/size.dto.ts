import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';

export const SizeSystem = {
  EU: 'eu',
  US: 'us',
} as const;

export type SizeSystem = (typeof SizeSystem)[keyof typeof SizeSystem];

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
  @IsUUID()
  id: string;

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
  id: string;
  size: string;
  system: null | SizeSystem;
  isActive: boolean;
}
