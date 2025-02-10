import { HeartIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { cookies } from 'next/headers';

import { auth, getServerClient } from '~/shared/api';
import {
  Button,
  ContentContainer,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/shared/ui';
import { LoginModal } from '~/features/authentication';
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
import {
  ProductDetailsAddToCartButton,
  ProductDetailsLikeButton,
  UnselectedSizeAlert,
} from '../_ui/product-details';

const client = getServerClient({ isRSC: true });

export default async function ProductPage(props: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await props.params;
  const cookieStore = await cookies();
  const { body, status } = await client.catalog.getProductDetails({
    extraHeaders: { Cookie: cookieStore.toString() }, // Attach session cookie
    params: { id: productSlug },
  });
  if (status === 404) notFound();
  const { details } = body.data;
  const session = await auth();

  return (
    <ContentContainer className="grid w-full flex-1 auto-rows-auto grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[45%_55%] lg:gap-16">
      <ScrollToTop />
      <ProductSelectionDetailsProvider sizeVariants={details.sizes}>
        <Gallery images={details.images} />
        <div className="md:max-w-[500px]">
          <div className="mb-3 flex items-center space-x-2">
            {details.brand.iconUrl && (
              <Image
                unoptimized
                alt=""
                className="rounded-full border border-solid border-border p-1"
                height={30}
                src={details.brand.iconUrl}
                width={30}
              />
            )}
            <p className="font-bold">{details.brand.name}</p>
          </div>
          <h1 className="mb-5 text-3xl font-bold">{details.name}</h1>
          <p className="mb-5 text-4xl font-extrabold">
            <ProductPrice
              hasDiscount={!!details.formattedDiscount}
              defaultPrice={
                details.formattedPriceRange || details.formattedPrice
              }
              defaultPriceWithDiscount={
                details.formattedDiscount
                  ? details.formattedPriceRangeWithDiscount ||
                    details.formattedPriceWithDiscount
                  : undefined
              }
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
              <ProductDetailsAddToCartButton />
            ) : (
              <p className="pr-5 text-2xl text-zinc-500">Is out of stock</p>
            )}
            {session?.user?.id ? (
              <ProductDetailsLikeButton
                isFavourite={details.isFavourite}
                productVarId={details.variantId}
              />
            ) : (
              <LoginModal>
                <Button className="px-3" size="lg" variant="secondary">
                  <HeartIcon className="size-5" />
                </Button>
              </LoginModal>
            )}
          </div>
          <UnselectedSizeAlert />
        </div>
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="space-x-7 bg-background p-0">
              <TabsTrigger
                className="p-0 text-xl font-semibold text-zinc-500 focus-visible:ring-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                value="details"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                className="p-0 text-xl font-semibold text-zinc-500 focus-visible:ring-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                value="reviews"
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
              />
            </TabsContent>
            <TabsContent value="reviews">TODO</TabsContent>
          </Tabs>
        </div>
      </ProductSelectionDetailsProvider>
    </ContentContainer>
  );
}
