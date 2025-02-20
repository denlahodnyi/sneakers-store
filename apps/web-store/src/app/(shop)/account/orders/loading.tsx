import { Skeleton } from '~/shared/ui';

function Fallback() {
  return <Skeleton className="h-[24px] w-[100px]" />;
}

export default function Loading() {
  return (
    <div className="flex-1 sm:px-4">
      <h1 className="mb-4 text-3xl">Orders</h1>
      <div className="mb-5 grid max-w-[400px] grid-cols-3 divide-y">
        <div className="col-span-3 grid grid-cols-subgrid py-2">
          <Fallback />
          <Fallback />
          <Fallback />
        </div>
        <div className="col-span-3 grid grid-cols-subgrid py-2">
          <Fallback />
          <Fallback />
          <Fallback />
        </div>
        <div className="col-span-3 grid grid-cols-subgrid py-2">
          <Fallback />
          <Fallback />
          <Fallback />
        </div>
        <div className="col-span-3 grid grid-cols-subgrid py-2">
          <Fallback />
          <Fallback />
          <Fallback />
        </div>
      </div>
    </div>
  );
}
