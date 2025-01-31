import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { booleanString } from './custom-transformers.js';

export type SuccessResponseData<TData> = {
  status: 'success';
  data: TData;
};

export type ErrorResponseData = {
  status: 'error';
  statusCode: number;
  message: string | null;
  details: string | null;
  errors: FormattedErrors | inferDtoErrors<any> | null;
};

export type PaginationDto = {
  totalItems: number;
  totalPages: number;
  perPage: number;
  current: number;
  prev: number | null;
  next: number | null;
};

export class QueryWithPagination {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  perPage?: number;
}

export interface FormattedErrors {
  [k: string]: string[] | FormattedErrors;
}

type RecursiveFormat<TObj extends any> = {
  [Key in keyof TObj]: TObj[Key] extends object
    ? FormattedFieldErrors<TObj[Key]>
    : string[];
};

type FormattedFieldErrors<DTOInstance> = RecursiveFormat<DTOInstance>;

export type inferDtoErrors<
  DTO extends (new (...args: any) => any) | Record<any, any>,
> = FormattedFieldErrors<
  DTO extends new (...args: any) => any ? InstanceType<DTO> : DTO
>;
