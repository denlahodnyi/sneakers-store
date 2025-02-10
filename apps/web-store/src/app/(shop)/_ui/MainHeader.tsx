import { CircleUserRoundIcon, HeartIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import CartTrigger from '~/app/(shop)/_ui/CartTrigger';
import { LoginModal } from '~/features/authentication';
import { FiltersSearchParam } from '~/features/filter-products';
import { ProductsSearchForm } from '~/features/search-products';
import { getServerClient, TOTAL_LIKES_TAG, type Session } from '~/shared/api';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ContentContainer,
} from '~/shared/ui';

const client = getServerClient({ isRSC: true });

const getUserInitials = (name: string) => {
  const [firstName, lastName = ''] = name.split(' ');
  return `${firstName[0]}${lastName[0] || ''}`;
};

async function MainHeader({ user }: { user: Session['user'] }) {
  const cookieStore = await cookies();
  const { body, status } = await client.favoriteProducts.getTotalFavProducts({
    extraHeaders: { Cookie: cookieStore.toString() },
    fetchOptions: {
      next: {
        tags: [TOTAL_LIKES_TAG],
      },
    },
  });
  const totalFavourites = status === 200 ? body.data.total : null;

  return (
    <header className="sticky top-0 z-10 bg-background">
      <ContentContainer className="p-0 sm:p-0">
        <div className="grid-rows-[repeat(3, auto)] md:grid-rows-[repeat(2, auto)] mx-3 grid grid-cols-2 gap-x-2 gap-y-4 border-b border-border pb-2 pt-3 sm:mx-10 sm:pb-4 sm:pt-5 md:grid-cols-3 md:gap-y-8">
          <Link aria-label="To home page" href="/">
            <Image
              alt=""
              className="size-[60px] rounded-sm"
              height={1790}
              src="/logo_1790x1790.png"
              width={1790}
            />
          </Link>
          <div className="col-span-2 row-start-2 self-center md:col-start-2 md:col-end-3 md:row-start-1">
            <ProductsSearchForm />
          </div>
          <nav className="flex items-center justify-end space-x-3 md:space-x-6 lg:space-x-10">
            <CartTrigger />
            {user?.id ? (
              <Button
                asChild
                className="relative flex h-auto flex-col items-center p-1 leading-none"
                variant="ghost"
              >
                <Link href="/account/favourites">
                  <span className="relative">
                    <span className="absolute -right-[16px] -top-[11px] z-[1] min-w-[22px] rounded-full bg-tertiary p-1 text-center text-tertiary-foreground">
                      {totalFavourites || 0}
                    </span>
                    <HeartIcon className="h-6 w-6" />
                  </span>
                  Favourites
                </Link>
              </Button>
            ) : (
              <LoginModal>
                <Button
                  className="flex h-auto flex-col items-center p-1 leading-none"
                  variant="ghost"
                >
                  <HeartIcon className="h-6 w-6" />
                  Favourites
                </Button>
              </LoginModal>
            )}
            {user?.id ? (
              <Button
                asChild
                className="h-auto w-auto rounded-full p-0"
                variant="ghost"
              >
                <Link href="/account/profile">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image || ''} />
                    <AvatarFallback>
                      {user.name ? getUserInitials(user.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            ) : (
              <LoginModal>
                <Button
                  className="h-auto w-auto rounded-full p-0"
                  variant="ghost"
                >
                  <CircleUserRoundIcon className="h-12 w-12" strokeWidth={1} />
                </Button>
              </LoginModal>
            )}
          </nav>

          <nav className="col-span-2 row-start-3 space-x-5 sm:space-x-10 md:col-span-3 md:row-start-2">
            <Link
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
              href={`/store?${FiltersSearchParam.GENDER}=men`}
            >
              Men
            </Link>
            <Link
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
              href={`/store?${FiltersSearchParam.GENDER}=women`}
            >
              Women
            </Link>
            <Link
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
              href={`/store?${FiltersSearchParam.GENDER}=kids`}
            >
              Kids
            </Link>
            <Link
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
              href="/store/brands"
            >
              Brands
            </Link>
            <Link
              className="text-destructive decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
              href="/store?sale=true"
            >
              Sale
            </Link>
          </nav>
        </div>
      </ContentContainer>
    </header>
  );
}

export default MainHeader;
