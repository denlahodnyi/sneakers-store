import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

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

  @IsUUID()
  userId?: string;

  @IsDateString()
  expires?: string;
}

export class SessionResponseDto {
  sessionToken: string;
  userId: string;
  expires: string;
}
