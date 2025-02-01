// @nestjs/mapped-types was removed because it breaks Nextjs build process (in
// Dashboard at middleware)
// import { PartialType, PickType } from '@nestjs/mapped-types';

// class-transformer MUST BE 0.3.1, otherwise don't use @nestjs/mapped-types
// cause it breaks on frontend (but not on backend)
// https://stackoverflow.com/questions/70802610/module-not-found-error-cant-resolve-class-transformer-storage-angular-uni
import { Transform } from 'class-transformer';
import {
  IsAlphanumeric,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';
import { QueryWithPagination } from './misc.js';

export const Role = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export class UserQueryDto extends QueryWithPagination {
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  providerAccountId?: string;
  @IsOptional()
  provider?: string;
}

export class UserCreateDto {
  @IsOptional()
  @Transform(trim)
  @MinLength(1, { message: 'Name is too short' })
  name?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsDateString()
  emailVerified?: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  @Transform(trim)
  @MinLength(5)
  @MaxLength(10)
  @IsAlphanumeric()
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role | null;
}

export class UserUpdateDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @Transform(trim)
  @MinLength(1, { message: 'Name is too short' })
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  emailVerified?: string | null;

  @IsOptional()
  image?: string | null;

  @IsOptional()
  @Transform(trim)
  @MinLength(5)
  @MaxLength(10)
  @IsAlphanumeric()
  password?: string | null;

  @IsOptional()
  @IsEnum(Role)
  role?: Role | null;
}

export class UserSignInDto {
  @IsEmail()
  email: string;

  @Transform(trim)
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  @IsAlphanumeric()
  password: string;

  @IsOptional()
  @IsBoolean()
  asAdmin?: boolean;
}

export class UserResponseDto {
  id: string;
  email: string | null;
  name: string | null;
  emailVerified: string | null;
  image: string | null;
  role: null | 'admin' | 'super_admin';
}
