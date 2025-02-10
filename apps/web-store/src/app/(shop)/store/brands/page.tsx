import Link from 'next/link';

import { FiltersSearchParam } from '~/features/filter-products';
import { getServerClient } from '~/shared/api';
import { cn } from '~/shared/lib';
import { ContentContainer } from '~/shared/ui';

const client = getServerClient();

export default async function BrandsPage() {
  const { body } = await client.brands.getBrands({ query: { active: true } });
  const { brands } = body.data;

  return (
    <ContentContainer className="w-full flex-1">
      <h1 className="mb-3 text-3xl md:mb-5 md:text-5xl">Explore our brands</h1>
      <div className="grid auto-rows-[minmax(100px,_160px)] grid-cols-[repeat(auto-fit,minmax(160px,_1fr))] gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/store?${FiltersSearchParam['BRAND']}=${brand.id}`}
            className={cn(
              'flex items-center justify-center rounded-md border border-solid border-border bg-contain bg-center bg-no-repeat p-4 text-center text-lg font-bold transition-transform hover:scale-[1.05] hover:border-secondary md:text-3xl',
            )}
            style={{
              backgroundImage: `linear-gradient(hsl(var(--background) / 0.9), hsl(var(--background))), url(${brand.iconUrl})`,
            }}
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </ContentContainer>
  );
}
