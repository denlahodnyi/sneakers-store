import { CircleUserRoundIcon, HeartIcon, ShoppingBagIcon } from 'lucide-react';
import Link from 'next/link';
import { GiConverseShoe } from 'react-icons/gi';

import { LoginModal } from '~/features/authentication';
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
    <header className="sticky top-0 bg-background">
      <ContentContainer className="p-0 sm:p-0">
        <div className="mx-3 flex justify-between border-b border-border py-3 sm:mx-10 sm:py-5">
          <Link aria-label="To home page" href="/">
            <GiConverseShoe className="text-5xl" />
          </Link>
          <nav className="flex items-center space-x-3 sm:space-x-10">
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
        </div>
      </ContentContainer>
    </header>
  );
}

export default MainHeader;
