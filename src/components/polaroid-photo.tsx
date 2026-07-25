"use client";

import Image from "next/image";

interface PolaroidPhotoProps {
  src: string;
  alt: string;
  caption?: string;
  rotation?: number;
  className?: string;
  priority?: boolean;
}

/**
 * A single Polaroid-style photo card: white frame, thick bottom border,
 * slight rotation, optional handwritten-style caption. Used in the
 * lookbook "world building" grid on the homepage.
 */
export function PolaroidPhoto({
  src,
  alt,
  caption,
  rotation = 0,
  className = "",
  priority = false,
}: PolaroidPhotoProps) {
  return (
    <div
      className={`bg-white p-3 pb-10 shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:z-10 transition-all duration-300 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 45vw, 300px"
          priority={priority}
        />
      </div>
      {caption && (
        <p
          className="text-center text-neutral-700 text-sm mt-3 leading-none"
          style={{ fontFamily: "var(--font-scriptina)" }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
