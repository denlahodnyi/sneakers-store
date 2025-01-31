import { HeartIcon, ShoppingBagIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { getClient } from '~/shared/api';
import {
  Button,
  ContentContainer,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/shared/ui';
import {
  ColorVariantLink,
  LastItemsAlert,
  ProductPrice,
  ProductSelectionDetailsProvider,
  SelectedSize,
  SizeButton,
} from '../_ui';
import Gallery from '../_ui/Gallery';
import ScrollToTop from './TopScroll';

const client = getClient();

export default async function ProductPage(props: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await props.params;
  const { body, status } = await client.catalog.getProductDetails({
    params: { id: productSlug },
  });
  if (status === 404) notFound();
  const { details } = body.data;

  return (
    <ContentContainer className="grid w-full flex-1 auto-rows-auto grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[45%_55%] lg:gap-16">
      <ScrollToTop />
      <ProductSelectionDetailsProvider sizeVariants={details.sizes}>
        <Gallery images={details.images} />
        <div className="md:max-w-[500px]">
          <div className="mb-3 flex items-center space-x-2">
            {details.brand.iconUrl && (
              <Image
                alt=""
                height={30}
                src={details.brand.iconUrl}
                width={30}
                unoptimized
                className="rounded-full border border-solid border-border p-1"
              />
            )}
            <p className="font-bold">{details.brand.name}</p>
          </div>
          <h1 className="mb-5 text-3xl font-bold">{details.name}</h1>
          <p className="mb-5 text-4xl font-extrabold">
            <ProductPrice
              defaultPrice={
                details.formattedPriceRange || details.formattedPrice
              }
              defaultPriceWithDiscount={
                details.formattedDiscount
                  ? details.formattedPriceRangeWithDiscount ||
                    details.formattedPriceWithDiscount
                  : undefined
              }
              hasDiscount={!!details.formattedDiscount}
            />
            {details.formattedDiscount && (
              <span className="ml-1 rounded-sm bg-destructive px-1 text-3xl text-destructive-foreground">{`-${details.formattedDiscount}`}</span>
            )}
          </p>
          <h2 className="mb-3">
            Color • <span className="text-zinc-500">{details.color.name}</span>
          </h2>
          <div className="mb-5 flex space-x-3">
            {details.variants.map((variant) => (
              <ColorVariantLink
                key={variant.id}
                color={variant.color.name}
                disabled={variant.id === details.variantId}
                hex={variant.color.hex}
                href={`/store/product/${variant.slug}`}
              />
            ))}
          </div>
          <h2 className="mb-3">
            Size •{' '}
            <span className="text-zinc-500">
              <SelectedSize defaultSize="Choose your size" />
            </span>
          </h2>
          <div className="mb-8">
            <div className="mb-2 space-x-3">
              {details.sizes.map((o) => (
                <SizeButton
                  key={o.id}
                  className="min-w-14 px-2"
                  disabled={!o.isInStock}
                  sizeId={o.id}
                >
                  {o.size}
                </SizeButton>
              ))}
            </div>
            <LastItemsAlert className="text-destructive" />
          </div>
          <div className="flex items-center gap-2">
            {details.isInStock ? (
              <Button className="w-full" size="lg">
                <ShoppingBagIcon className="size-5" />
                Add to cart
              </Button>
            ) : (
              <p className="pr-5 text-2xl text-zinc-500">Is out of stock</p>
            )}
            <Button className="px-3" size="lg" variant="secondary">
              <HeartIcon className="size-5" />
            </Button>
          </div>
        </div>
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="space-x-7 bg-background p-0">
              <TabsTrigger
                value="details"
                className="p-0 text-xl font-semibold text-zinc-500 focus-visible:ring-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="p-0 text-xl font-semibold text-zinc-500 focus-visible:ring-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div
                className="lg:max-w-[50%]"
                dangerouslySetInnerHTML={{
                  __html: details.product.descriptionHtml || '',
                }}
              ></div>
            </TabsContent>
            <TabsContent value="reviews">TODO</TabsContent>
          </Tabs>
        </div>
      </ProductSelectionDetailsProvider>
    </ContentContainer>
  );
}
