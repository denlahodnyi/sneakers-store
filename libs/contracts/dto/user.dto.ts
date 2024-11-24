import { PartialType, PickType } from '@nestjs/mapped-types';
// class-transformer MUST BE 0.3.1, otherwise don't use @nestjs/mapped-types
// cause it breaks on frontend (but not on backend)
// https://stackoverflow.com/questions/70802610/module-not-found-error-cant-resolve-class-transformer-storage-angular-uni
import { Transform } from 'class-transformer';
import {
  IsAlphanumeric,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trim } from './custom-transformers.js';

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
}

export class UserUpdateDto extends PartialType(UserCreateDto) {
  @IsUUID()
  id: string;
}

export class UserSignInDto extends PickType(UserCreateDto, ['email']) {
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
