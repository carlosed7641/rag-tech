"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  name,
  discount,
}: {
  images: string[];
  name: string;
  discount?: number | null;
}) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={name} className="h-full w-full object-contain" />
        {discount ? (
          <span className="absolute left-4 top-4 rounded-md bg-ink px-2.5 py-1 tabular-nums text-[13px] text-lime">
            −{discount}%
          </span>
        ) : null}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1} de ${name}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden rounded-xl bg-surface ${
                i === active ? "ring-2 ring-ink" : "ring-1 ring-line hover:ring-line-strong"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
