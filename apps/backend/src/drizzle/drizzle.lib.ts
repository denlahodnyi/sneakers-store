import type { Column, InferColumnsDataTypes, SQL } from 'drizzle-orm';

export type InferSQLDataType<T extends SQL | SQL.Aliased> =
  T extends SQL<infer U> ? U : T extends SQL.Aliased<infer U> ? U : never;

export type InferRecordDataTypes<
  T extends Record<
    string,
    Column | SQL | SQL.Aliased | Record<string, Column | SQL | SQL.Aliased>
  >,
> = {
  [K in keyof T]: T[K] extends SQL | SQL.Aliased
    ? InferSQLDataType<T[K]>
    : T[K] extends Column
      ? InferColumnsDataTypes<{ col: T[K] }>['col']
      : T[K] extends Record<string, Column | SQL | SQL.Aliased>
        ? InferRecordDataTypes<T[K]>
        : never;
};
