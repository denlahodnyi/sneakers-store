import type { TransformFnParams } from 'class-transformer';

export const trim = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

export const booleanString = ({ value, type }: TransformFnParams) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};
