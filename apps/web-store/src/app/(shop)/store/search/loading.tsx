import { ContentContainer, Skeleton } from '~/shared/ui';

function ResultItemSkeleton() {
  return (
    <div className="grid grid-cols-[auto,1fr] gap-x-3 rounded-md border border-border bg-background p-2">
      <Skeleton className="size-[100px] rounded-md" />
      <div className="space-y-1">
        <Skeleton className="h-[20px] w-1/3" />
        <Skeleton className="h-[28px] w-full" />
        <Skeleton className="h-[20px] w-1/3" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <ContentContainer className="w-full max-w-[500px] flex-1 space-y-5">
      <ResultItemSkeleton />
      <ResultItemSkeleton />
      <ResultItemSkeleton />
      <ResultItemSkeleton />
    </ContentContainer>
  );
}
