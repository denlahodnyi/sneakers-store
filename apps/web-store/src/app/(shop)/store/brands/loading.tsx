import { ContentContainer, Skeleton } from '~/shared/ui';

function FallbackItem() {
  return <Skeleton className="rounded-md" />;
}

export default function Loading() {
  return (
    <ContentContainer className="w-full flex-1">
      <h1 className="mb-3 text-3xl md:mb-5 md:text-5xl">Explore our brands</h1>
      <div className="grid auto-rows-[minmax(100px,_160px)] grid-cols-[repeat(auto-fit,minmax(160px,_1fr))] gap-3">
        <FallbackItem />
        <FallbackItem />
        <FallbackItem />
        <FallbackItem />
        <FallbackItem />
        <FallbackItem />
        <FallbackItem />
        <FallbackItem />
      </div>
    </ContentContainer>
  );
}
