import { Skeleton } from '~/shared/ui';

export default function Fallback() {
  return (
    <div className="grid w-full grid-cols-2 grid-rows-[300px] gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  );
}
