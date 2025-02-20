import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { booleanString } from './custom-transformers.js';

export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export class DiscountQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(booleanString)
  active?: boolean;
  @IsOptional()
  @IsUUID()
  productVarId?: string;
}

export class DiscountCreateDto {
  @IsUUID()
  productVarId: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @IsPositive()
  discountValue: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DiscountUpdateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  productVarId?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  discountValue?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export interface DiscountResponseDto {
  id: string;
  productVarId: string;
  discountType: DiscountType;
  discountValue: number;
  formattedDiscount: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}
