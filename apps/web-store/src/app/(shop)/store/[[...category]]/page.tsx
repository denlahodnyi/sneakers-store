import { ArrowUpDownIcon, FilterIcon } from 'lucide-react';
import type { CatalogQueryDto } from '@sneakers-store/contracts';

import {
  FiltersProvider,
  FiltersSearchParam,
  SORT_SEARCH_PARAM,
  SortDropdown,
} from '~/features/filter-products';
import { getClient } from '~/shared/api';
import { Button, ContentContainer } from '~/shared/ui';
import { ProductCard } from '~/widgets/product-card';
import {
  CatalogPagination,
  DesktopFiltersPanel,
  MobileFiltersDrawer,
} from '../_ui';

const client = getClient();

type Params = Promise<{ category?: string[] }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CatalogPage(props: {
  searchParams: SearchParams;
  params: Params;
}) {
  const params = await props.params;
  const sp = await props.searchParams;
  const qp: Record<string, string | string[] | undefined> = {
    categorySlug: params.category?.[0] || undefined,
    [SORT_SEARCH_PARAM]: sp[SORT_SEARCH_PARAM],
  };

  for (const [key, param] of Object.entries(FiltersSearchParam)) {
    if (sp[param]) qp[param] = sp[param];
  }

  const [productsRes, filtersRes] = await Promise.all([
    client.catalog.getProducts({
      query: {
        ...qp,
        page: typeof sp.page === 'string' ? Number(sp.page) : undefined,
      },
    }),
    client.catalog.getFilters({
      query: qp,
    }),
  ]);
  const { products, pagination } = productsRes.body.data;
  const filters = filtersRes.body.data;

  return (
    <ContentContainer className="w-full flex-1">
      <FiltersProvider filters={filters}>
        <div className="grid auto-rows-[40px_auto_auto] grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
          <aside className="row-span-3 hidden pr-3 sm:block">
            <DesktopFiltersPanel />
          </aside>
          <div className="mb-4 flex items-center">
            <MobileFiltersDrawer>
              <Button
                className="mr-4 flex sm:hidden"
                size="icon"
                variant="ghost"
              >
                <FilterIcon />
              </Button>
            </MobileFiltersDrawer>
            <p className="mr-4 text-zinc-500">
              {pagination.totalItems}: item
              {pagination.totalItems === 1 ? '' : 's'}
            </p>
            <SortDropdown>
              <Button size="icon" variant="ghost">
                <ArrowUpDownIcon />
              </Button>
            </SortDropdown>
          </div>
          {!products.length ? (
            <div className="grid grid-cols-1 grid-rows-1">
              <p className="text-lg font-light text-zinc-500">
                No products found
              </p>
            </div>
          ) : (
            <>
              <div className="grid auto-rows-min grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
              <div className="py-6">
                <CatalogPagination pagination={pagination} />
              </div>
            </>
          )}
        </div>
      </FiltersProvider>
    </ContentContainer>
  );
}
