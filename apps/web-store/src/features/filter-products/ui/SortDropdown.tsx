'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { ArrowDown01Icon, ArrowDown10Icon } from 'lucide-react';
import type { CatalogQueryDto } from '@sneakers-store/contracts';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/shared/ui';
import { SORT_SEARCH_PARAM } from '../model';

const PRICE_ASC: NonNullable<CatalogQueryDto['sort']> = 'price';
const PRICE_DESC: NonNullable<CatalogQueryDto['sort']> = '-price';

export default function SortDropdown({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sp.get(SORT_SEARCH_PARAM) || ''}
          onValueChange={(value) => {
            const searchParams = new URLSearchParams(sp.toString());
            searchParams.set(SORT_SEARCH_PARAM, value);
            router.push(pathname + '?' + searchParams.toString());
          }}
        >
          <DropdownMenuRadioItem className="" value={PRICE_DESC}>
            <ArrowDown01Icon className="mr-3" />
            Lowest price
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="" value={PRICE_ASC}>
            <ArrowDown10Icon className="mr-3" />
            Highest price
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
