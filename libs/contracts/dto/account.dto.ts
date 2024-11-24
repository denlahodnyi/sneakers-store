import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AccountCreateDto {
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  type: 'email' | 'oidc' | 'webauthn' | 'oauth'; // AdapterAccountType

  @IsNotEmpty()
  provider: string;

  @IsNotEmpty()
  providerAccountId: string;

  @IsOptional()
  refresh_token?: string;

  @IsOptional()
  access_token?: string;

  @IsOptional()
  @IsInt()
  expires_at?: number;

  @IsOptional()
  token_type?: string;

  @IsOptional()
  scope?: string;

  @IsOptional()
  id_token?: string;

  @IsOptional()
  session_state?: string;
}

export class AccountResponseDto {
  type: 'email' | 'oidc' | 'webauthn' | 'oauth';
  userId: string;
  access_token: string | null;
  id_token: string | null;
  refresh_token: string | null;
  scope: string | null;
  token_type: string | null;
  provider: string;
  providerAccountId: string;
  expires_at: number | null;
  session_state: string | null;
}
