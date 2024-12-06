import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';

export class CategoryCreateDto {
  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CategoryUpdateDto {
  @IsUUID()
  id: string;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
}
