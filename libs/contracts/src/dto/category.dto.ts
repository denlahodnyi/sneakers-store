import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { booleanString, trim } from './custom-transformers.js';

export class CategoryQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(booleanString)
  active?: boolean;
}

export class CategoryCreateDto {
  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CategoryUpdateDto {
  @IsInt()
  id: number;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  name?: CategoryCreateDto['name'];

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  slug?: CategoryCreateDto['slug'];

  @IsOptional()
  @IsInt()
  parentId?: CategoryCreateDto['parentId'];

  @IsOptional()
  @IsBoolean()
  isActive?: CategoryCreateDto['isActive'];
}

export class CategoryResponseDto {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
}
