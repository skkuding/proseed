'use client'

import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface Props {
  images: string[]
}

export function ProjectImageCarousel({ images }: Props) {
  return (
    <Carousel opts={{ align: 'start' }} className="w-full">
      <CarouselContent className="-ml-4">
        {images.map((src, idx) => (
          <CarouselItem key={idx} className="pl-4 basis-auto">
            <div className="relative h-[474px] w-[826px] overflow-hidden rounded-xl bg-gray-100">
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 size-10 bg-white/80 hover:bg-white border-none" />
      <CarouselNext className="right-4 size-10 bg-white/80 hover:bg-white border-none" />
    </Carousel>
  )
}
