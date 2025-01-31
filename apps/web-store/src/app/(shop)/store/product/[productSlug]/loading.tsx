import { ContentContainer, Skeleton } from '~/shared/ui';

export default function PageLoading() {
  return (
    <ContentContainer className="grid w-full flex-1 auto-rows-auto grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[45%_55%] lg:gap-16">
      <div>
        <div className="mb-4 aspect-square w-full">
          <Skeleton className="aspect-square w-full" />
        </div>
        <div>
          <Skeleton className="size-[100px]" />
        </div>
      </div>
      <div className="md:max-w-[500px]">
        <div className="mb-3 flex items-center space-x-2">
          <Skeleton className="h-[24px] w-[200px]" />
        </div>
        <Skeleton className="mb-5 h-[36px] w-[300px]" />
        <Skeleton className="mb-5 h-[40px] w-[200px]" />
        <Skeleton className="mb-3 h-[24px] w-[100px]" />
        <div className="mb-5">
          <Skeleton className="size-[24px]" />
        </div>
        <Skeleton className="mb-3 h-[24px] w-[100px]" />
        <div className="mb-8">
          <Skeleton className="h-[40px] w-[56px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-[44px] w-full" />
          <Skeleton className="size-[44px]" />
        </div>
      </div>
      <div className="md:col-span-2">
        <Skeleton className="h-[24px] w-full" />
      </div>
    </ContentContainer>
  );
}
