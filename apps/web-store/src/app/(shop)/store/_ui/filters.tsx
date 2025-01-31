import type { PropsWithChildren } from 'react';

import {
  ApplyFiltersButton,
  BrandsFilter,
  CategoriesTree,
  ColorsFilter,
  GenderFilter,
  PriceRangeFilter,
  ResetAllFiltersButton,
  SizesFilter,
} from '~/features/filter-products';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '~/shared/ui';

export function DesktopFiltersPanel() {
  return (
    <>
      <Accordion type="multiple">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent className="">
            <CategoriesTree />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <BrandsFilter />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <ColorsFilter />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-3">
            <PriceRangeFilter />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sizes">
          <AccordionTrigger>Sizes</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <SizesFilter />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="genders">
          <AccordionTrigger>Genders</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <GenderFilter />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="mt-5 space-y-2">
        <ApplyFiltersButton className="block w-full" />
        <ResetAllFiltersButton className="block w-full" />
      </div>
    </>
  );
}

export function MobileFiltersDrawer({ children }: PropsWithChildren) {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bottom-0 top-0 mt-0 rounded-none">
        <DrawerHeader>
          <DrawerTitle>All filters</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <Accordion type="multiple">
            <AccordionItem value="brands">
              <AccordionTrigger>Brands</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <BrandsFilter />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="colors">
              <AccordionTrigger>Colors</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <ColorsFilter />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price">
              <AccordionTrigger>Price</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-3">
                <PriceRangeFilter />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sizes">
              <AccordionTrigger>Sizes</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <SizesFilter />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="genders">
              <AccordionTrigger>Genders</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <GenderFilter />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DrawerFooter>
          <ApplyFiltersButton className="block w-full" />
          <ResetAllFiltersButton className="block w-full" />
          <DrawerClose>
            <Button className="w-full" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
