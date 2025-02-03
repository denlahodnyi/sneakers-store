import type { PropsWithChildren } from 'react';
import { HeartIcon, ReceiptIcon, UserIcon } from 'lucide-react';

import { auth } from '~/shared/api';
import { LoginForm } from '~/features/authentication';
import { Button, ContentContainer } from '~/shared/ui';
import { SidebarLogoutButton, SidebarLink } from './_ui';

async function AccountLayout({ children }: PropsWithChildren) {
  const session = await auth();
  return (
    <ContentContainer className="flex w-full flex-1 flex-col sm:flex-row">
      <div className="relative w-full sm:contents sm:w-auto">
        <Button asChild className="w-full sm:hidden" variant="outline">
          <label className="peer" htmlFor="foo">
            Menu
            <input className="sr-only" id="foo" type="checkbox" />
          </label>
        </Button>
        <aside className="absolute z-[1] hidden w-full border border-border bg-background pr-1 peer-has-[:checked]:block sm:static sm:block sm:w-[200px] sm:border-0 sm:border-r">
          <nav className="flex flex-col">
            <SidebarLink href="/account/profile">
              <UserIcon />
              Profile
            </SidebarLink>
            <SidebarLink href="/account/favourites">
              <HeartIcon />
              Favourites
            </SidebarLink>
            <SidebarLink href="/account/orders">
              <ReceiptIcon />
              Orders
            </SidebarLink>
          </nav>
          <SidebarLogoutButton variant="ghost" />
        </aside>
      </div>
      {session?.user?.id ? (
        <>{children}</>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="mb-4 text-xl">Please, login to access that page</h2>
          <LoginForm />
        </div>
      )}
    </ContentContainer>
  );
}

export default AccountLayout;
