import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';
import FavoriteProductCard from './_ui/FavoriteProductCard';

const client = getServerClient({ isRSC: true });

async function FavouritesPage() {
  const cookieStore = await cookies();
  const { body } = await client.favoriteProducts.getFullFavProducts({
    extraHeaders: { Cookie: cookieStore.toString() },
  });
  const products = body.status === 'success' ? body.data.products : [];

  return (
    <div className="flex-1 sm:px-4">
      <h1 className="mb-4 text-3xl">Favourite products</h1>
      {products.length ? (
        <div className="max-w-[500px] space-y-3">
          {products.map((p) => (
            <FavoriteProductCard key={p.productVariant.id} product={p} />
          ))}
        </div>
      ) : (
        <p>You have no favorite products yet</p>
      )}
    </div>
  );
}

export default FavouritesPage;
