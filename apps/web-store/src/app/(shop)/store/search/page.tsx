import { getServerClient } from '~/shared/api';
import { ContentContainer } from '~/shared/ui';
import { ProductSearchResultItem } from './_ui';

const client = getServerClient({ isRSC: true });

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string[] | string | undefined>>;
}) {
  const sp = await searchParams;
  if (!sp.q) {
    return (
      <ContentContainer className="flex-1">
        <div className="py-2">
          <p className="text-center text-xl">
            Nothing to search. Please fill the search field
          </p>
        </div>
      </ContentContainer>
    );
  }
  const { body } = await client.catalog.searchByCatalog({
    query: { q: sp.q as string },
  });
  const { products } = body.data;

  return (
    <ContentContainer className="w-full max-w-[500px] flex-1">
      {products.length ? (
        <div className="space-y-5">
          {products.map((p) => (
            <ProductSearchResultItem key={p.productVariant.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="py-2">
          <p className="text-center text-xl">No products found</p>
        </div>
      )}
    </ContentContainer>
  );
}
