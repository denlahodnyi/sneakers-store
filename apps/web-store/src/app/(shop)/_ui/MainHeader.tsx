import { CircleUserRoundIcon, HeartIcon, ShoppingBagIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { LoginModal } from '~/features/authentication';
import { FiltersSearchParam } from '~/features/filter-products';
import { ProductsSearchForm } from '~/features/search-products';
import type { Session } from '~/shared/api';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ContentContainer,
} from '~/shared/ui';

const getUserInitials = (name: string) => {
  const [firstName, lastName = ''] = name.split(' ');
  return `${firstName[0]}${lastName[0] || ''}`;
};

function MainHeader({ user }: { user: Session['user'] }) {
  return (
    <header className="sticky top-0 z-10 bg-background">
      <ContentContainer className="p-0 sm:p-0">
        <div className="grid-rows-[repeat(3, auto)] md:grid-rows-[repeat(2, auto)] mx-3 grid grid-cols-2 gap-x-2 gap-y-4 border-b border-border pb-2 pt-3 sm:mx-10 sm:pb-4 sm:pt-5 md:grid-cols-3 md:gap-y-8">
          <Link aria-label="To home page" href="/">
            <Image
              src="/logo_1790x1790.png"
              alt=""
              className="size-[60px] rounded-sm"
              width={1790}
              height={1790}
            />
          </Link>
          <div className="col-span-2 row-start-2 self-center md:col-start-2 md:col-end-3 md:row-start-1">
            <ProductsSearchForm />
          </div>
          <nav className="flex items-center justify-end space-x-3 md:space-x-6 lg:space-x-10">
            <Button
              asChild
              className="flex h-auto flex-col items-center p-1 leading-none"
              variant="ghost"
            >
              <Link href="#">
                <ShoppingBagIcon className="h-6 w-6" />
                Cart
              </Link>
            </Button>
            <Button
              asChild
              className="flex h-auto flex-col items-center p-1 leading-none"
              variant="ghost"
            >
              <Link href="#">
                <HeartIcon className="h-6 w-6" />
                Favorites
              </Link>
            </Button>
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
              href={`/store?${FiltersSearchParam.GENDER}=men`}
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
            >
              Men
            </Link>
            <Link
              href={`/store?${FiltersSearchParam.GENDER}=women`}
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
            >
              Women
            </Link>
            <Link
              href={`/store?${FiltersSearchParam.GENDER}=kids`}
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
            >
              Kids
            </Link>
            <Link
              href="/store/brands"
              className="decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
            >
              Brands
            </Link>
            <Link
              href="/store?sale=true"
              className="text-destructive decoration-transparent underline-offset-2 transition duration-300 hover:underline hover:decoration-tertiary"
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
