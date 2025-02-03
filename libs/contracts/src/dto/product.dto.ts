import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { booleanString, trim } from './custom-transformers.js';
import type { CategoryResponseDto } from './category.dto.js';
import type { ColorResponseDto } from './color.dto.js';
import type { BrandResponseDto } from './brand.dto.js';
import type { SizeResponseDto } from './size.dto.js';
import { QueryWithPagination } from './misc.js';
import type { DiscountResponseDto } from './discount.dto.js';

export const Gender = {
  MEN: 'men',
  WOMEN: 'women',
  KIDS: 'kids',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const PRICE_MINOR_UNITS = 100;

export class ProductQueryDto extends QueryWithPagination {
  @IsOptional()
  @IsBoolean()
  @Transform(booleanString)
  active?: boolean;
  @IsOptional()
  priorIds?: string;
}

export class ProductCreateDto {
  @IsInt()
  brandId: number;

  @IsInt()
  categoryId: number;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  description?: string | null;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ProductUpdateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsInt()
  brandId?: ProductCreateDto['brandId'];

  @IsOptional()
  @IsInt()
  categoryId?: ProductCreateDto['categoryId'];

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name?: ProductCreateDto['name'];

  @IsOptional()
  description?: ProductCreateDto['description'] | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: ProductCreateDto['gender'];

  @IsOptional()
  @IsBoolean()
  isActive?: ProductCreateDto['isActive'];

  @IsOptional()
  @IsBoolean()
  isFeatured?: ProductCreateDto['isFeatured'];
}

export class ProductResponseDto {
  id: string;
  brandId: number | null;
  categoryId: number | null;
  name: string;
  description: string | null;
  gender: Gender;
  isActive: boolean;
  isFeatured: boolean;
}

export class PreviewProductResponseDto {
  id: string;
  brandId: number | null;
  categoryId: number | null;
  name: string;
  description: string | null;
  gender: Gender;
  isActive: boolean;
  isFeatured: boolean;
  brand: BrandResponseDto['name'] | null;
}

export class FullProductResponseDto {
  id: string;
  brandId: number | null;
  categoryId: number | null;
  name: string;
  description: string | null;
  descriptionHtml: string | null;
  gender: Gender;
  isActive: boolean;
  isFeatured: boolean;
  category: CategoryResponseDto['name'] | null;
  brand: BrandResponseDto['name'] | null;
  variants: {
    id: ProductVariantResponseDto['id'];
    name: ProductVariantResponseDto['name'];
    color: {
      name: ColorResponseDto['name'];
      hex: ColorResponseDto['hex'];
    } | null;
    discount: null | (DiscountResponseDto & { formattedDiscount: string });
  }[];
  skus: (ProductSkuResponseDto & {
    formattedPrice: string;
    size: SizeResponseDto | null;
  })[];
}

export interface ProductImage {
  id: string;
  publicId: string;
  productVarId: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export class ProductImageCreateDto {
  @IsDefined()
  publicId: string;

  @IsUUID()
  productVarId: string;

  @IsUrl()
  url: string;

  @IsOptional()
  alt?: string | null;

  @IsOptional()
  @IsInt()
  width?: number | null;

  @IsOptional()
  @IsInt()
  height?: number | null;
}

export class ProductImageUpdateDto {
  @IsDefined()
  id: string;

  @IsOptional()
  publicId?: string;

  @IsOptional()
  @IsUUID()
  productVarId?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  alt?: string | null;

  @IsOptional()
  @IsInt()
  width?: number | null;

  @IsOptional()
  @IsInt()
  height?: number | null;
}

export class ProductVariantQueryDto extends QueryWithPagination {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  fields?: string;
}

export class ProductVariantCreateDto {
  @IsUUID()
  productId: string;

  @IsInt()
  colorId: number;

  @IsOptional()
  @MaxLength(255)
  name?: string | null;

  @IsOptional()
  @MaxLength(255)
  slug?: string | null;

  @IsOptional()
  images?: Omit<ProductImage, 'id' | 'productVarId'>[];
}

export class ProductVariantUpdateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsInt()
  colorId?: number;

  @IsOptional()
  @MaxLength(255)
  name?: string | null;

  @IsOptional()
  @MaxLength(255)
  slug?: string | null;
}

// Basic response
export interface ProductVariantResponseDto {
  id: string;
  productId: string;
  colorId: number;
  name: string | null;
  slug: string | null;
  images: ProductImage[];
  // Can be retrieved using query
  color?: {
    name: ColorResponseDto['name'];
    hex: ColorResponseDto['hex'];
  };
}

// Single record details
export interface FullProductVariantResponseDto {
  id: string;
  productId: string;
  colorId: number;
  name: string | null;
  slug: string | null;
  images: ProductImage[];
  color: {
    name: ColorResponseDto['name'];
    hex: ColorResponseDto['hex'];
  };
}

export class ProductSkuQueryDto extends QueryWithPagination {
  @IsOptional()
  @IsBoolean()
  @Transform(booleanString)
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
  @IsInt()
  sizeId?: number | null;

  @MinLength(1)
  @MaxLength(50)
  sku: string;

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
  @IsInt()
  sizeId?: number | null;

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  sku?: string;

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

export interface ProductSkuResponseDto {
  id: string;
  productId: string;
  productVarId: string;
  sizeId: number | null;
  sku: string;
  stockQty: number;
  basePrice: number;
  isActive: boolean;
}

//  @TODO: refactor
export interface FullProductSkuResponseDto {
  id: string;
  productId: string;
  productVarId: string;
  sizeId: number | null;
  sku: string;
  stockQty: number;
  basePrice: number;
  price: number;
  formattedPrice: string;
  isActive: boolean;
  product: Omit<
    FullProductResponseDto,
    'variants' | 'descriptionHtml' | 'skus'
  >;
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

export class FavProductCreateDto {
  @IsUUID()
  productVarId: string;
}

export class FavProductRemoveDto {
  @IsUUID()
  productVarId: string;
}

export interface FavProductDto {
  product: ProductResponseDto;
  productVariant: Omit<
    ProductVariantResponseDto,
    'color' | 'images' | 'slug'
  > & { slug: string };
  brand: BrandResponseDto;
  category: CategoryResponseDto;
  image: ProductImage | null;
  discount: DiscountResponseDto | null;
  formattedPrice: string;
  formattedPriceWithDiscount: string;
  minBasePrice: number;
  maxBasePrice: number;
  minBasePriceWithDiscount: number;
  maxBasePriceWithDiscount: number;
  minPrice: number;
  maxPrice: number;
  minPriceWithDiscount: number;
  maxPriceWithDiscount: number;
  formattedPriceRange: string | null;
  formattedPriceRangeWithDiscount: string | null;
  totalQty: number;
  isInStock: boolean;
  isFavourite: boolean;
}
