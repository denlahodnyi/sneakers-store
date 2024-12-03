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

export class CategoryUpdateDto extends PartialType(CategoryCreateDto) {
  @IsUUID()
  id: string;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
}
