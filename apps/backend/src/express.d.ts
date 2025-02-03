import type { UserEntity } from './db/schemas/user.schema.ts';

declare module 'express' {
  export interface Request {
    user?: UserEntity;
  }
}
