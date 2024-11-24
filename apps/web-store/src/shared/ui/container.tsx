import type { PropsWithChildren } from 'react';

import { cn } from '../lib';

function ContentContainer({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        'max-w-screen-3xl mx-auto px-3 py-3 sm:px-10 sm:py-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export { ContentContainer };
