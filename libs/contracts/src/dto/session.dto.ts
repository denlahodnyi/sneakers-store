import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SessionCreateDto {
  @IsNotEmpty()
  sessionToken: string;
  @IsUUID()
  userId: string;
  @IsDateString()
  expires: string;
}

export class SessionUpdateDto {
  @IsNotEmpty()
  sessionToken: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDateString()
  expires?: string;
}

export class SessionResponseDto {
  sessionToken: string;
  userId: string;
  expires: string;
}
