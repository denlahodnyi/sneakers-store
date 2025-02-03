import type { CatalogSearchDto } from '@sneakers-store/contracts';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductSearchResultItem({
  product,
}: {
  product: CatalogSearchDto;
}) {
  return (
    <Link
      className="grid grid-cols-[auto,1fr] gap-x-3 rounded-md border border-border bg-background p-2"
      href={`/store/product/${product.productVariant.slug}`}
    >
      <div className="relative size-[100px] rounded-md">
        <Image
          fill
          alt={product.image?.alt || ''}
          className="rounded-[inherit] object-cover"
          sizes="33vw"
          src={product.image?.url || '/placeholder_2_1080x1080.webp'}
        />
      </div>
      <div className="space-y-1">
        <div className="flex">
          {product.brand.iconUrl && (
            <Image
              alt=""
              className="mr-2 size-[20px] rounded-full border border-border p-1"
              height={20}
              src={product.brand.iconUrl}
              width={20}
            />
          )}
          <p className="text-sm text-zinc-500">{product.brand.name}</p>
        </div>
        <h2 className="text-lg sm:text-xl">
          {product.productVariant.name || product.product.name}
        </h2>
        <p className="text-sm italic text-zinc-500">{`${product.category.name} (${product.product.gender})`}</p>
      </div>
    </Link>
  );
}
