'use client';
import type { CatalogProductDetailsDto } from '@sneakers-store/contracts';
import { useState } from 'react';
import Image from 'next/image';

import placeholderImg from '../../../../../../public/placeholder_2_1080x1080.webp';
import { cn } from '~/shared/lib';

export default function Gallery({
  images,
}: {
  images: CatalogProductDetailsDto['images'];
}) {
  const [selected, setSelected] = useState(0);
  const currentImg = images.length ? images[selected] : null;
  // const currentImgSizes =
  //   images.length && images[selected].width && images[selected].height
  //     ? { width: images[selected].width, height: images[selected].height }
  //     : {};
  return (
    <div>
      <div className="relative mb-4 aspect-square w-full rounded-md">
        <Image
          src={currentImg?.url || placeholderImg}
          alt={currentImg?.alt || ''}
          className="rounded-[inherit] object-cover"
          fill
          quality={90}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          loading="eager"
          placeholder="empty"
          // {...currentImgSizes}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div
            key={img.id}
            className={cn(
              'relative size-[100px] rounded-md',
              selected === i && 'border border-solid border-tertiary',
            )}
            onMouseEnter={() => setSelected(i)}
          >
            <Image
              src={img.url}
              alt={img.alt || ''}
              fill
              className="rounded-[inherit] object-cover"
              quality={10}
              sizes="5vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
