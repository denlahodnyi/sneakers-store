export type SuccessResponseData<TData> = {
  status: 'success';
  data: TData;
};

export type ErrorResponseData = {
  status: 'error';
  statusCode: number;
  message: string | null;
  details: string | null;
  errors: FormattedErrors | null;
};

export interface FormattedErrors {
  [k: string]: string[] | FormattedErrors;
}
