'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import arrowLeft from '../../../../../public/arrow2_left.svg'
import arrowRight from '../../../../../public/arrow2_right.svg'
import { ImageLightbox } from './ImageLightbox'

interface Props {
  images: string[]
}

export function ProjectImageCarousel({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const isOpen = lightboxIndex !== null
  const currentIndex = lightboxIndex ?? 0

  return (
    <>
      <Carousel opts={{ align: 'start' }} className="w-full">
        <CarouselContent className="px-1">
          {images.map((src, idx) => (
            <CarouselItem key={idx} className="pl-3 basis-auto">
              <div
                className="relative h-[474px] w-[826px] overflow-hidden rounded-xl bg-gray-100 cursor-pointer"
                onClick={() => setLightboxIndex(idx)}
              >
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="ghost"
          className="absolute left-4 size-10 flex items-center justify-center hover:bg-zinc-400 hover:cursor-pointer"
        >
          <Image src={arrowLeft} alt="이전" width={24} height={24} className="shadow-2xl" />
        </CarouselPrevious>

        <CarouselNext
          variant="ghost"
          className="absolute right-4 size-10 flex items-center justify-center hover:bg-zinc-400 hover:cursor-pointer"
        >
          <Image src={arrowRight} alt="다음" width={24} height={24} className="shadow-2xl" />
        </CarouselNext>
      </Carousel>

      <ImageLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex((i) => (i! - 1 + images.length) % images.length)}
        onNext={() => setLightboxIndex((i) => (i! + 1) % images.length)}
      />
    </>
  )
}
