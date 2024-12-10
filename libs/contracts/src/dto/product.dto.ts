import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';
import type { CategoryResponseDto } from './category.dto.js';
import type { ColorResponseDto } from './color.dto.js';
import type { BrandResponseDto } from './brand.dto.js';
import type { SizeResponseDto } from './size.dto.js';

export const Gender = {
  MEN: 'men',
  WOMEN: 'women',
  KIDS: 'kids',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export class ProductCreateDto {
  @IsUUID()
  brandId: string;

  @IsUUID()
  categoryId: string;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProductUpdateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @MaxLength(255)
  description?: string | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProductResponseDto {
  id: string;
  brandId: string | null;
  categoryId: string | null;
  name: string;
  description: string | null;
  gender: Gender;
  isActive: boolean;
}

export class PreviewProductResponseDto {
  id: string;
  brandId: string | null;
  categoryId: string | null;
  name: string;
  description: string | null;
  gender: Gender;
  isActive: boolean;
  brand: BrandResponseDto['name'] | null;
}

export class FullProductResponseDto {
  id: string;
  brandId: string | null;
  categoryId: string | null;
  name: string;
  description: string | null;
  gender: Gender;
  isActive: boolean;
  category: CategoryResponseDto['name'] | null;
  brand: BrandResponseDto['name'] | null;
  variants: {
    id: ProductVariantResponseDto['id'];
    color: {
      name: ColorResponseDto['name'];
      hex: ColorResponseDto['hex'];
    } | null;
  }[];
}

export class ProductVariantQueryDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  fields?: string;
}

export class ProductVariantCreateDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  colorId: string;

  @IsOptional()
  previewImg: string | null;
  @IsOptional()
  thumbnailImg: string | null;
  @IsOptional()
  smallImg: string | null;
  @IsOptional()
  largeImg: string | null;
}

export class ProductVariantUpdateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  colorId?: string;

  @IsOptional()
  previewImg?: string | null;
  @IsOptional()
  thumbnailImg?: string | null;
  @IsOptional()
  smallImg?: string | null;
  @IsOptional()
  largeImg?: string | null;
}

// Basic response
export class ProductVariantResponseDto {
  id: string;
  productId: string;
  colorId: string;
  previewImg: string | null;
  thumbnailImg: string | null;
  smallImg: string | null;
  largeImg: string | null;
  // Can be retrieved using query
  color?: {
    name: ColorResponseDto['name'];
    hex: ColorResponseDto['hex'];
  };
}

// Single record details
export class FullProductVariantResponseDto {
  id: string;
  productId: string;
  colorId: string;
  previewImg: string | null;
  thumbnailImg: string | null;
  smallImg: string | null;
  largeImg: string | null;
  color: {
    name: ColorResponseDto['name'];
    hex: ColorResponseDto['hex'];
  };
}

export class ProductSkuQuery {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class ProductSkuCreateDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  productVarId: string;

  @IsOptional()
  @IsUUID()
  sizeId?: string | null;

  @MinLength(1)
  @MaxLength(50)
  sku: string;

  @IsOptional()
  @MaxLength(150)
  name?: string | null;

  @IsOptional()
  @MaxLength(255)
  slug?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value) : value
  )
  stockQty: number;

  @IsOptional()
  @Min(0)
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value
  )
  basePrice: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProductSkuUpdateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  productVarId?: string;

  @IsOptional()
  @IsUUID()
  sizeId?: string | null;

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  sku?: string;

  @IsOptional()
  @MaxLength(150)
  name?: string | null;

  @IsOptional()
  @MaxLength(255)
  slug?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value) : value
  )
  stockQty?: number;

  @IsOptional()
  @Min(0)
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value
  )
  basePrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProductSkuResponseDto {
  id: string;
  productId: string;
  productVarId: string;
  sizeId: string | null;
  sku: string;
  name: string | null;
  slug: string | null;
  stockQty: number;
  basePrice: number;
  isActive: boolean;
}

export class FullProductSkuResponseDto {
  id: string;
  productId: string;
  productVarId: string;
  sizeId: string | null;
  sku: string;
  name: string | null;
  slug: string | null;
  stockQty: number;
  basePrice: number;
  isActive: boolean;
  product: Omit<FullProductResponseDto, 'variants'>;
  variant: ProductVariantResponseDto;
  color: {
    name: ColorResponseDto['name'];
    hex: ColorResponseDto['hex'];
  };
  size: {
    value: SizeResponseDto['size'];
    system: SizeResponseDto['system'];
  } | null;
}
