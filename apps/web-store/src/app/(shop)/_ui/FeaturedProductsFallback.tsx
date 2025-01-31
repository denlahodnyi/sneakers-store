import { Skeleton } from '~/shared/ui';

export default function FeaturedProductsFallback() {
  return (
    <div className="mx-auto grid grid-cols-2 gap-5 md:max-w-[1000px] md:grid-cols-4 md:gap-10">
      <Skeleton className="h-[300px] w-full md:odd:-mt-4 md:even:mt-4" />
      <Skeleton className="h-[300px] w-full md:odd:-mt-4 md:even:mt-4" />
      <Skeleton className="h-[300px] w-full md:odd:-mt-4 md:even:mt-4" />
      <Skeleton className="h-[300px] w-full md:odd:-mt-4 md:even:mt-4" />
    </div>
  );
}
