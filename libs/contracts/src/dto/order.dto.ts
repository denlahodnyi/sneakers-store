import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsPhoneNumber,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { DiscountType, type DiscountResponseDto } from './discount.dto.js';
import type { ProductImage, ProductResponseDto } from './product.dto.js';
import type { BrandResponseDto } from './brand.dto.js';
import type { CategoryResponseDto } from './category.dto.js';
import { QueryWithPagination } from './misc.js';
import type { SizeResponseDto } from './size.dto.js';
import type { ColorResponseDto } from './color.dto.js';
import { Type } from 'class-transformer';
import type { UserResponseDto } from './user.dto.js';

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELED: 'canceled',
  REFUND: 'refund',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export class OrderQueryDto extends QueryWithPagination {}

export class OrderAddress {
  @IsString()
  line1: string;
  @IsString()
  line2: string;
  @IsString()
  state: string;
  @IsString()
  country: string;
  @IsString()
  city: string;
  @IsString()
  postalCode: string;
}

class Discount {
  @IsEnum([DiscountType.FIXED, DiscountType.PERCENTAGE])
  discountType: DiscountType;
  @IsNumber()
  @IsPositive()
  discountValue: number;
}

class OrderLine {
  @IsUUID()
  productSkuId: string;
  @IsInt()
  @IsPositive()
  priceInCents: number;
  @IsInt()
  @IsPositive()
  finalPriceInCents: number;
  @IsInt()
  @IsPositive()
  qty: number;
  @IsOptional()
  @Type(() => Discount)
  @ValidateNested()
  discount?: null | Discount;
}

export class OrderCreateDto {
  @IsOptional()
  @IsUUID()
  userId?: null | string;
  @IsInt()
  @IsPositive()
  priceInCents: number;
  @IsInt()
  @IsPositive()
  totalPriceInCents: number;
  @IsOptional()
  @IsInt()
  @IsPositive()
  totalDiscountInCents: null | number;
  @IsOptional()
  @IsString()
  customerName?: null | string;
  @IsOptional()
  @IsEmail()
  email?: null | string;
  @IsOptional()
  @IsPhoneNumber()
  phone?: null | string;
  @IsOptional()
  @Type(() => OrderAddress) // @Type must be used for @ValidateNested
  @ValidateNested()
  address?: null | OrderAddress;
  @IsEnum(PaymentStatus)
  payStatus: PaymentStatus;
  @Type(() => OrderLine)
  @ValidateNested({ each: true })
  items: OrderLine[];
}

interface BaseOrderLine {
  id: string;
  orderId: string;
  productSkuId: string;
  price: number;
  priceInCents: number;
  finalPrice: number;
  finalPriceInCents: number;
  qty: number;
  discountValue: null | DiscountResponseDto['discountValue'];
  discountType: null | DiscountResponseDto['discountType'];
}

export interface OrderResponseDto {
  id: string;
  userId: null | string;
  price: number;
  priceInCents: number;
  totalPrice: number;
  totalPriceInCents: number;
  totalDiscount: null | number;
  totalDiscountInCents: null | number;
  formattedTotalPrice: string;
  formattedTotalDiscount: null | string;
  payStatus: PaymentStatus;
  customerName: null | string;
  email: null | string;
  phone: null | string;
  address: null | {
    line1: string;
    line2: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: null | string;
}

export interface FullOrderResponseDto extends OrderResponseDto {
  user: null | UserResponseDto;
  items: (BaseOrderLine & {
    productName: string;
    formattedPrice: string;
    formattedFinalPrice: string;
    formattedDiscount: null | string;
  })[];
}

export interface UserOrderResponseDto extends OrderResponseDto {}

export interface UserFullOrderResponseDto extends UserOrderResponseDto {
  items: (BaseOrderLine & {
    productVariantId: string;
    productName: string;
    slug: string;
    gender: ProductResponseDto['gender'];
    category: null | CategoryResponseDto;
    brand: null | BrandResponseDto;
    size: null | SizeResponseDto;
    image: null | ProductImage;
    color: ColorResponseDto;
    formattedPrice: string;
    formattedFinalPrice: string;
    formattedDiscount: null | string;
  })[];
}
