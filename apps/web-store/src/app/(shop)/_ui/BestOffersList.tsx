'use server';
import { getServerClient } from '~/shared/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/shared/ui';
import { ProductCard } from '~/widgets/product-card';

const client = getServerClient();

export default async function BestOffersList() {
  const { body } = await client.catalog.getProducts({
    query: { sale: 'true', perPage: 10 },
  });
  const products = body.data.products;

  return (
    <Carousel className="max-w-full" opts={{ align: 'start' }}>
      <CarouselContent className="mb-3 md:mb-0">
        {products.map((p) => (
          <CarouselItem
            key={p.productId}
            className="basis-1/2 md:basis-1/3 lg:basis-1/5"
          >
            <ProductCard product={p} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        className="static translate-y-0 [&_svg]:size-7 md:[&_svg]:size-4"
        variant="ghost"
      />
      <CarouselNext
        className="static ml-5 translate-y-0 md:ml-1 [&_svg]:size-7 md:[&_svg]:size-4"
        variant="ghost"
      />
    </Carousel>
  );
}
