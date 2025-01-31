import {
  ArrowLeftRightIcon,
  FileBadgeIcon,
  HeadsetIcon,
  MoveRight,
} from 'lucide-react';
import {
  BestOffersList,
  BestOffersListFallback,
  FeaturedProducts,
  FeaturedProductsFallback,
} from './_ui';
import { Suspense } from 'react';
import { Button, ContentContainer } from '~/shared/ui';
import Image from 'next/image';
import Link from 'next/link';

function HomePage() {
  return (
    <ContentContainer className="w-full flex-1 space-y-20">
      <div className="relative flex aspect-[4/3] w-full gap-10 lg:aspect-[2/1] lg:gap-12">
        <div className="absolute bottom-0 top-0 z-10 w-1/2 flex-1 bg-white/90 p-2 min-[480px]:static min-[480px]:z-0 min-[480px]:w-auto min-[480px]:bg-transparent">
          <h1 className="mb-5 text-xl font-black min-[480px]:text-4xl md:text-6xl lg:mb-8 lg:text-7xl xl:text-8xl">
            Your Perfect Pair Awaits – Shop the Latest Trends!
          </h1>
          <Button
            asChild
            variant="tertiary"
            className="min-[480px]:px-8 min-[480px]:py-6 min-[480px]:text-2xl"
          >
            <Link href="/store">
              Show now
              <MoveRight />
            </Link>
          </Button>
        </div>
        <div className="relative flex-1">
          <Image
            fill
            src="/banner_2.jpg"
            alt=""
            className="object-cover"
            sizes="(min-width: 480px) 50vw, 100vw"
            priority
          />
        </div>
      </div>

      <section>
        <h2 className="mb-10 text-center text-3xl font-extrabold md:text-4xl">
          Featured products
        </h2>
        <Suspense fallback={<FeaturedProductsFallback />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      <section>
        <h2 className="mb-10 text-center text-3xl font-extrabold md:text-4xl">
          Our benefits
        </h2>
        <ul className="mx-auto flex max-w-[600xp] justify-between gap-3 lg:max-w-[800px]">
          <li className="flex-1 text-center">
            <FileBadgeIcon
              className="mb-3 inline-block size-[36px]"
              aria-hidden
            />
            <p className="text-xl">100% authentic products</p>
          </li>
          <li className="flex-1 text-center">
            <ArrowLeftRightIcon
              className="mb-3 inline-block size-[36px]"
              aria-hidden
            />
            <p className="text-xl">Hassle-free returns</p>
          </li>
          <li className="flex-1 text-center">
            <HeadsetIcon
              className="mb-3 inline-block size-[36px]"
              aria-hidden
            />
            <p className="text-xl">24/7 Customer Support</p>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-10 text-center text-3xl font-extrabold md:text-4xl">
          Best offers
        </h2>
        <Suspense fallback={<BestOffersListFallback />}>
          <BestOffersList />
        </Suspense>
      </section>
    </ContentContainer>
  );
}

export default HomePage;
