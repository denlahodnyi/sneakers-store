'use client';

import type { CatalogFiltersResponseDto } from '@sneakers-store/contracts';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from 'react';

import { cn } from '~/shared/lib';
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  getConicGradientFromHexes,
  Input,
  Slider,
  useForm,
  useFormContext,
  type ButtonProps,
} from '~/shared/ui';
import { FiltersSearchParam } from '../model';

export interface FiltersContextValue {
  filters: CatalogFiltersResponseDto;
}

interface FormFields {
  [FiltersSearchParam.COLOR]: number[];
  [FiltersSearchParam.SIZE]: number[];
  [FiltersSearchParam.BRAND]: number[];
  [FiltersSearchParam.GENDER]: string[];
  [FiltersSearchParam.PRICE]: number[];
}

const defaultFormValues: FormFields = {
  [FiltersSearchParam.COLOR]: [],
  [FiltersSearchParam.SIZE]: [],
  [FiltersSearchParam.BRAND]: [],
  [FiltersSearchParam.GENDER]: [],
  [FiltersSearchParam.PRICE]: [0, 0],
};

export const FiltersContext = createContext<FiltersContextValue>(
  {} as FiltersContextValue,
);

export function useFiltersContext() {
  const ctx = useContext(FiltersContext);
  if (ctx === undefined) {
    throw new Error('useFiltersContext must be used within a FiltersProvider');
  }
  return ctx;
}

export function FiltersProvider({
  children,
  filters,
}: PropsWithChildren & { filters: CatalogFiltersResponseDto }) {
  const getFormValuesFromFilters = (filters: CatalogFiltersResponseDto) => {
    return {
      [FiltersSearchParam.COLOR]: filters.colors.values
        .filter((o) => o.selected)
        .map((o) => o.id),
      [FiltersSearchParam.SIZE]: filters.size.values
        .filter((o) => o.selected)
        .map((o) => o.id),
      [FiltersSearchParam.BRAND]: filters.brands.values
        .filter((o) => o.selected)
        .map((o) => o.id),
      [FiltersSearchParam.GENDER]: filters.genders.values
        .filter((o) => o.selected)
        .map((o) => o.gender),
      [FiltersSearchParam.PRICE]: [
        filters.price.applied.minPrice || filters.price.available.minPrice || 0,
        filters.price.applied.maxPrice || filters.price.available.maxPrice || 0,
      ],
    };
  };

  const form = useForm<FormFields>({
    defaultValues: defaultFormValues,
    values: getFormValuesFromFilters(filters),
  });

  return (
    <FiltersContext.Provider value={{ filters }}>
      <Form {...form}>{children}</Form>
    </FiltersContext.Provider>
  );
}

export function ApplyFiltersButton(props: ButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { reset, formState, handleSubmit } = useFormContext();

  const createQueryString = useCallback(
    (values: FormFields) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.keys(values).forEach((key) => {
        const val = values[key as keyof FormFields];
        // Price filter is always filled so we need to add its param only when
        // it was changed by user
        if (
          (key !== FiltersSearchParam.PRICE && val.length) ||
          (key === FiltersSearchParam.PRICE &&
            formState.dirtyFields[FiltersSearchParam.PRICE] &&
            val.length)
        ) {
          params.set(key, val.toString());
        }
        // If nothing was selected – delete param
        if (params.has(key) && !val.length) {
          params.delete(key);
        }
      });

      return params.toString();
    },
    [formState.dirtyFields, searchParams],
  );

  return (
    <Button
      disabled={!formState.isDirty}
      variant="outline"
      onClick={() => {
        handleSubmit((data) => {
          router.push(pathname + '?' + createQueryString(data as FormFields));
          reset(data);
        })();
      }}
      {...props}
    >
      Apply
    </Button>
  );
}

export function ResetAllFiltersButton(props: ButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { reset } = useFormContext();

  return (
    <Button
      disabled={!searchParams.size}
      variant="outline"
      onClick={() => {
        router.push(pathname);
        reset(defaultFormValues);
      }}
      {...props}
    >
      Reset all
    </Button>
  );
}

export function CategoriesTree() {
  const { filters } = useFiltersContext();
  const { category: slugs } = useParams();
  const category = slugs?.[0]; // /store/:category
  return (
    <ul className="space-y-2 font-medium">
      {filters.categories.values.map((o) => (
        <li key={o.id} className="mt-2">
          <Link
            href={`/store/${o.slug}`}
            className={cn(
              'hover:underline',
              category === o.slug && 'font-extrabold text-foreground',
            )}
          >
            {o.name}
          </Link>
          <CategoriesTreeChildren categoryChildren={o.children} />
        </li>
      ))}
    </ul>
  );
}

function CategoriesTreeChildren({
  categoryChildren,
}: {
  categoryChildren: CatalogFiltersResponseDto['categories']['values'][number]['children'];
}) {
  const { category: slugs } = useParams();
  const category = slugs?.[0];
  if (!categoryChildren.length) return null;
  return (
    <ul className="ml-2">
      {categoryChildren.map((o) => (
        <li key={o.id} className="mt-2">
          <Link
            href={`/store/${o.slug}`}
            className={cn(
              'hover:underline',
              category === o.slug && 'font-extrabold text-foreground',
            )}
          >
            {o.name}
          </Link>
          <CategoriesTreeChildren categoryChildren={o.children} />
        </li>
      ))}
    </ul>
  );
}

export function PriceRangeFilter() {
  const { filters } = useFiltersContext();
  const form = useFormContext();
  return (
    <>
      <FormField
        control={form.control}
        name={FiltersSearchParam.PRICE}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <FormControl>
                <Slider
                  className="mx-auto w-11/12"
                  max={filters.price.available.maxPrice || 0}
                  min={filters.price.available.minPrice || 0}
                  step={1}
                  value={field.value}
                  onValueChange={([min, max]) => field.onChange([min, max])}
                />
              </FormControl>
            </FormLabel>
          </FormItem>
        )}
      />
      <div className="mt-2 flex space-x-1">
        <FormField
          control={form.control}
          name={FiltersSearchParam.PRICE}
          render={({ field }) => {
            const { value, onChange, ...rest } = field;
            return (
              <FormItem>
                <FormLabel>
                  Lowest price
                  <FormControl>
                    <Input
                      {...rest}
                      value={value[0]}
                      onChange={(e) => onChange([e.target.value, value[1]])}
                    />
                  </FormControl>
                </FormLabel>
              </FormItem>
            );
          }}
        />
        <span className="mt-10 leading-[0]">–</span>
        <FormField
          control={form.control}
          name={FiltersSearchParam.PRICE}
          render={({ field }) => {
            const { value, onChange, ...rest } = field;
            return (
              <FormItem>
                <FormLabel>
                  Highest price
                  <FormControl>
                    <Input
                      {...rest}
                      value={value[1]}
                      onChange={(e) => onChange([value[0], e.target.value])}
                    />
                  </FormControl>
                </FormLabel>
              </FormItem>
            );
          }}
        />
      </div>
    </>
  );
}

export function ColorsFilter() {
  const { filters } = useFiltersContext();
  const form = useFormContext();
  return (
    <>
      {filters.colors.values.map((attr) => (
        <FormField
          key={attr.id}
          control={form.control}
          name={FiltersSearchParam.COLOR}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  'flex items-center',
                  attr.disabled && 'opacity-30',
                )}
              >
                <FormControl>
                  <Checkbox
                    {...field}
                    checked={Array.from(field.value).includes(attr.id)}
                    disabled={attr.disabled}
                    size="lg"
                    onCheckedChange={(checked) =>
                      checked
                        ? field.onChange([...field.value, attr.id])
                        : field.onChange(
                            (field.value as []).filter((v) => v !== attr.id),
                          )
                    }
                  />
                </FormControl>
                <span
                  className="ml-3 mr-1 inline-block size-4 rounded-full border border-border"
                  style={{
                    backgroundImage: getConicGradientFromHexes(attr.hex),
                  }}
                />
                <span>{attr.name}</span>
              </FormLabel>
            </FormItem>
          )}
        />
      ))}
    </>
  );
}

export function BrandsFilter() {
  const { filters } = useFiltersContext();
  const form = useFormContext();
  return (
    <>
      {filters.brands.values.map((attr) => (
        <FormField
          key={attr.id}
          control={form.control}
          name={FiltersSearchParam.BRAND}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  'flex items-center',
                  attr.disabled && 'opacity-30',
                )}
              >
                <FormControl>
                  <Checkbox
                    size="lg"
                    {...field}
                    checked={Array.from(field.value).includes(attr.id)}
                    disabled={attr.disabled}
                    onCheckedChange={(checked) =>
                      checked
                        ? field.onChange([...field.value, attr.id])
                        : field.onChange(
                            (field.value as []).filter((v) => v !== attr.id),
                          )
                    }
                  />
                </FormControl>
                <span className="ml-3">{attr.name}</span>
              </FormLabel>
            </FormItem>
          )}
        />
      ))}
    </>
  );
}

export function SizesFilter() {
  const { filters } = useFiltersContext();
  const form = useFormContext();
  return (
    <>
      {filters.size.values.map((attr) => (
        <FormField
          key={attr.id}
          control={form.control}
          name={FiltersSearchParam.SIZE}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  'flex items-center',
                  attr.disabled && 'opacity-30',
                )}
              >
                <FormControl>
                  <Checkbox
                    size="lg"
                    {...field}
                    checked={Array.from(field.value).includes(attr.id)}
                    disabled={attr.disabled}
                    onCheckedChange={(checked) =>
                      checked
                        ? field.onChange([...field.value, attr.id])
                        : field.onChange(
                            (field.value as []).filter((v) => v !== attr.id),
                          )
                    }
                  />
                </FormControl>
                <span className="ml-3">
                  {attr.size} {attr.system ? `(${attr.system})` : ''}
                </span>
              </FormLabel>
            </FormItem>
          )}
        />
      ))}
    </>
  );
}

export function GenderFilter() {
  const { filters } = useFiltersContext();
  const form = useFormContext();
  return (
    <>
      {filters.genders.values.map((attr) => (
        <FormField
          key={attr.gender}
          control={form.control}
          name={FiltersSearchParam.GENDER}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  'flex items-center',
                  attr.disabled && 'opacity-30',
                )}
              >
                <FormControl>
                  <Checkbox
                    size="lg"
                    {...field}
                    checked={Array.from(field.value).includes(attr.gender)}
                    disabled={attr.disabled}
                    onCheckedChange={(checked) =>
                      checked
                        ? field.onChange([...field.value, attr.gender])
                        : field.onChange(
                            (field.value as []).filter(
                              (v) => v !== attr.gender,
                            ),
                          )
                    }
                  />
                </FormControl>
                <span className="ml-3">{attr.title}</span>
              </FormLabel>
            </FormItem>
          )}
        />
      ))}
    </>
  );
}
