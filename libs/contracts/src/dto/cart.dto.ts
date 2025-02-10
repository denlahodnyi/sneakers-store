import {
  IsDefined,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import type { ColorResponseDto } from './color.dto.js';
import type {
  ProductImage,
  ProductResponseDto,
  ProductSkuResponseDto,
  ProductVariantResponseDto,
} from './product.dto.js';
import type { SizeResponseDto } from './size.dto.js';
import type { DiscountResponseDto } from './discount.dto.js';

export class CartItemCreateDto {
  @IsUUID()
  productSkuId: string;
  @IsInt()
  @IsPositive()
  qty: number;
}

export class CartItemUpdateDto {
  @IsOptional()
  @IsUUID()
  productSkuId?: string;
  @IsInt()
  @IsPositive()
  qty: number;
}

export class CartSyncBodyDto {
  @IsDefined()
  items: { productSkuId: string; qty: number }[];
}

export class CartGenBodyDto {
  @IsDefined()
  items: { productSkuId: string; qty: number }[];
}

interface CartItem {
  id: null | string; // null is only for guests
  cartId: null | string; // null is only for guests
  qty: number;
  stockQty: ProductSkuResponseDto['stockQty'];
  isInStock: boolean;
  price: number;
  formattedPrice: string;
  discountValue: null | DiscountResponseDto['discountValue'];
  discountType: null | DiscountResponseDto['discountType'];
  formattedDiscount: null | string;
  priceWithDiscount: number;
  formattedPriceWithDiscount: string;
  finalPrice: number;
  formattedFinalPrice: string;
  name: string;
  slug: string;
  color: ColorResponseDto;
  size: SizeResponseDto;
  image: null | ProductImage;
  productId: ProductResponseDto['id'];
  productVariantId: ProductVariantResponseDto['id'];
  productSkuId: ProductSkuResponseDto['id'];
}

export interface CartResponseDto {
  id: null | string; // null is only for guests
  items: CartItem[];
  totalQty: number;
  price: number;
  formattedPrice: string;
  totalDiscount: null | number; // fixed value, not percentages
  formattedTotalDiscount: null | string;
  totalPrice: number;
  formattedTotalPrice: string;
}
