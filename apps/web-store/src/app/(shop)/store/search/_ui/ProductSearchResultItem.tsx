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
      href={`/store/product/${product.productVariant.slug}`}
      className="grid grid-cols-[auto,1fr] gap-x-3 rounded-md border border-border bg-background p-2"
    >
      <div className="relative size-[100px] rounded-md">
        <Image
          src={product.image?.url || '/placeholder_2_1080x1080.webp'}
          alt={product.image?.alt || ''}
          fill
          sizes="33vw"
          className="rounded-[inherit] object-cover"
        />
      </div>
      <div className="space-y-1">
        <div className="flex">
          {product.brand.iconUrl && (
            <Image
              src={product.brand.iconUrl}
              alt=""
              width={20}
              height={20}
              className="mr-2 size-[20px] rounded-full border border-border p-1"
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
