import { ContentContainer, Skeleton } from '~/shared/ui';

export default function Loading() {
  return (
    <ContentContainer className="w-full flex-1">
      <div className="grid auto-rows-[40px_auto] grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
        <aside className="row-span-2 hidden pr-3 sm:block">
          <Skeleton className="h-[56px]" />
          <Skeleton className="h-[56px]" />
          <Skeleton className="h-[56px]" />
          <Skeleton className="h-[56px]" />
          <Skeleton className="h-[56px]" />
          <Skeleton className="h-[56px]" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-[40px]" />
            <Skeleton className="h-[40px]" />
          </div>
        </aside>
        <div className="mb-4 flex items-center">
          <Skeleton className="h-[40px] w-[150px]" />
        </div>
        <div className="grid auto-rows-min grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
        </div>
      </div>
    </ContentContainer>
  );
}
