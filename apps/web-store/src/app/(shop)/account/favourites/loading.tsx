import { Skeleton } from '~/shared/ui';

function FallbackItem() {
  return (
    <div className="grid grid-cols-[auto,1fr,auto] grid-rows-1 rounded-md border border-border bg-background">
      <div className="col-span-2 grid grid-cols-subgrid grid-rows-subgrid gap-x-3 p-2">
        <Skeleton className="size-[100px] rounded-md" />
        <div className="space-y-1">
          <Skeleton className="h-[20px] w-1/3" />
          <Skeleton className="h-[28px] w-full" />
          <Skeleton className="h-[20px] w-1/3" />
          <Skeleton className="h-[20px] w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex-1 sm:px-4">
      <h1 className="mb-4 text-3xl">Favourite products</h1>
      <div className="max-w-[500px] space-y-3">
        <FallbackItem />
        <FallbackItem />
        <FallbackItem />
      </div>
    </div>
  );
}
