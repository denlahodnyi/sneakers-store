'use server';
import { getClient } from '~/shared/api';
import { ProductCard } from '~/widgets/product-card';

const client = getClient();

export default async function FeaturedProducts() {
  const { body } = await client.catalog.getProducts({
    query: { featured: 'true', inStock: 'true', perPage: 4 },
  });
  const products = body.data.products;
  return (
    <div className="mx-auto grid grid-cols-2 gap-5 md:max-w-[1000px] md:grid-cols-4 md:gap-10">
      {products.map((p) => (
        <div key={p.productId} className="md:odd:-mt-4 md:even:mt-4">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
