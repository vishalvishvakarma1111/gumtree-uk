'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div
        className="w-full rounded-lg flex items-center justify-center text-gray-300 text-7xl"
        style={{ backgroundColor: '#f5f5f5', aspectRatio: '4/3' }}
      >
        📷
      </div>
    )
  }

  const prev = () => setSelected(s => (s - 1 + images.length) % images.length)
  const next = () => setSelected(s => (s + 1) % images.length)

  return (
    <>
      <div>
        {/* Main image */}
        <div
          className="relative w-full overflow-hidden rounded-lg bg-black"
          style={{ aspectRatio: '4/3' }}
        >
          <Image
            src={images[selected]}
            alt={`${title} – photo ${selected + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority={selected === 0}
          />

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Counter + Expand */}
          <div className="absolute bottom-3 flex items-center gap-2 right-3">
            {images.length > 1 && (
              <span className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                {selected + 1} / {images.length}
              </span>
            )}
            <button
              onClick={() => setLightbox(true)}
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              aria-label="View fullscreen"
            >
              <Expand size={14} />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="flex-shrink-0 w-[72px] h-[54px] rounded overflow-hidden transition-all"
                style={{
                  border: `2px solid ${selected === i ? '#0D475C' : 'transparent'}`,
                  opacity: selected === i ? 1 : 0.6,
                }}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  width={72}
                  height={54}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
                onClick={e => { e.stopPropagation(); prev() }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
                onClick={e => { e.stopPropagation(); next() }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div
            className="relative max-w-5xl max-h-full w-full h-full"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={images[selected]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <span className="absolute bottom-4 text-white/60 text-sm">
            {selected + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  )
}
