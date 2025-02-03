'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';

import { Button } from '~/shared/ui';

function SidebarLink({ children, href }: { href: string } & PropsWithChildren) {
  const pathname = usePathname();
  const isActive = href === pathname;
  return (
    <Button
      asChild
      className="w-full justify-between text-base"
      variant={isActive ? 'default' : 'ghost'}
    >
      <Link href={isActive ? '#' : href}>{children}</Link>
    </Button>
  );
}

export default SidebarLink;
