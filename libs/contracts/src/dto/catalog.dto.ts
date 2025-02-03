import { IsIn, IsOptional } from 'class-validator';
import type {
  FullProductResponseDto,
  Gender,
  ProductImage,
  ProductResponseDto,
  ProductSkuResponseDto,
  ProductVariantResponseDto,
} from './product.dto.js';
import type { ColorResponseDto } from './color.dto.js';
import type { BrandResponseDto } from './brand.dto.js';
import type { CategoryResponseDto } from './category.dto.js';
import type { SizeResponseDto } from './size.dto.js';
import { QueryWithPagination } from './misc.js';

export class CatalogQueryDto extends QueryWithPagination {
  @IsOptional()
  categorySlug?: string; // e.g. sneakers
  @IsOptional()
  colorIds?: string;
  @IsOptional()
  brandIds?: string;
  @IsOptional()
  sizeIds?: string;
  @IsOptional()
  genders?: string; // genders=men,women
  @IsOptional()
  price?: string; // price=100,300
  @IsOptional()
  sale?: string; // sale=true
  @IsOptional()
  featured?: string; // featured=true
  @IsOptional()
  inStock?: string; // inStock=true
  @IsOptional()
  @IsIn(['price', '-price'])
  sort?: 'price' | '-price';
}

export interface CatalogResponseDto {
  productId: ProductResponseDto['id'];
  gender: ProductResponseDto['gender'];
  name: ProductResponseDto['name'];
  isFeatured: ProductResponseDto['isFeatured'];
  category: {
    id: ProductResponseDto['categoryId'];
    name: CategoryResponseDto['name'];
  };
  brand: {
    id: BrandResponseDto['id'];
    name: BrandResponseDto['name'];
  };
  variants: {
    variantId: ProductVariantResponseDto['id'];
    variantName: ProductVariantResponseDto['name'];
    slug: ProductVariantResponseDto['slug'];
    color: ColorResponseDto['name'] | null;
    hex: ColorResponseDto['hex'] | null;
    totalQty: ProductSkuResponseDto['stockQty'];
    isInStock: boolean;
    formattedDiscount: string | null;
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
    images: ProductVariantResponseDto['images'];
    isFavourite: boolean;
  }[];
  totalQty: number;
  isInStock: boolean;
}

interface CategoryTree {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
  path: string[];
  children: CategoryTree[];
}

export interface CatalogFiltersResponseDto {
  colors: {
    title: string;
    values: Array<ColorResponseDto & { selected: boolean; disabled: boolean }>;
    queryParam: string;
  };
  brands: {
    title: string;
    values: Array<BrandResponseDto & { selected: boolean; disabled: boolean }>;
    queryParam: string;
  };
  size: {
    title: string;
    values: Array<SizeResponseDto & { selected: boolean; disabled: boolean }>;
    queryParam: string;
  };
  genders: {
    title: string;
    values: Array<
      { title: string; gender: Gender } & {
        selected: boolean;
        disabled: boolean;
      }
    >;
    queryParam: string;
  };
  categories: {
    title: string;
    values: CategoryTree[];
    queryParam: string;
  };
  price: {
    title: string;
    applied: {
      minBasePrice: null | number;
      maxBasePrice: null | number;
      minPrice: null | number;
      maxPrice: null | number;
    };
    available: {
      minBasePrice: null | number;
      maxBasePrice: null | number;
      minPrice: null | number;
      maxPrice: null | number;
    };
    queryParam: string;
  };
}

export interface CatalogProductDetailsDto {
  variantId: ProductVariantResponseDto['id'];
  name: ProductVariantResponseDto['name'];
  slug: NonNullable<ProductVariantResponseDto['slug']>;
  color: ColorResponseDto;
  product: Pick<
    FullProductResponseDto,
    'id' | 'name' | 'gender' | 'description' | 'descriptionHtml'
  >;
  category: Pick<CategoryResponseDto, 'id' | 'name'>;
  brand: Pick<BrandResponseDto, 'id' | 'name' | 'iconUrl'>;
  variants: (Omit<ProductVariantResponseDto, 'images'> & {
    slug: string;
    color: ColorResponseDto;
    isInStock: boolean;
  })[];
  sizes: (Pick<SizeResponseDto, 'id' | 'size' | 'system'> & {
    basePrice: number;
    basePriceWithDiscount: number;
    price: number;
    priceWithDiscount: number;
    formattedPrice: string;
    formattedPriceWithDiscount: string | null;
    isInStock: boolean;
    stockQty: number;
  })[];
  images: ProductVariantResponseDto['images'];
  discountType: string | null;
  discountValue: number | null;
  formattedDiscount: string | null;
  minBasePrice: number;
  maxBasePrice: number;
  minPrice: number;
  maxPrice: number;
  minBasePriceWithDiscount: number;
  maxBasePriceWithDiscount: number;
  minPriceWithDiscount: number;
  maxPriceWithDiscount: number;
  formattedPrice: string;
  formattedPriceWithDiscount: string;
  formattedPriceRange: string | null;
  formattedPriceRangeWithDiscount: string | null;
  isInStock: boolean;
  isFavourite: boolean;
}

export interface CatalogSearchDto {
  product: ProductResponseDto;
  productVariant: Omit<
    ProductVariantResponseDto,
    'color' | 'images' | 'slug'
  > & { slug: string };
  brand: BrandResponseDto;
  category: CategoryResponseDto;
  image: ProductImage | null;
  rank: number;
}
