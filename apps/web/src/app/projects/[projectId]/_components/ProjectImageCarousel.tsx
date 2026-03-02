'use client'

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
import { Ghost } from 'lucide-react'

interface Props {
  images: string[]
}

export function ProjectImageCarousel({ images }: Props) {
  return (
    <Carousel opts={{ align: 'start' }} className="w-full">
      <CarouselContent className="-ml-4">
        {images.map((src, idx) => (
          <CarouselItem key={idx} className="pl-3 basis-auto">
            <div className="relative h-[474px] w-[826px] overflow-hidden rounded-xl bg-gray-100">
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        variant="ghost"
        className="absolute left-4 size-10 flex items-center justify-center hover:bg-zinc-400"
      >
        <Image src={arrowLeft} alt="이전" width={24} height={24} className="shadow-2xl" />
      </CarouselPrevious>

      <CarouselNext
        variant="ghost"
        className="absolute right-4 size-10 flex items-center justify-center hover:bg-zinc-400"
      >
        <Image src={arrowRight} alt="다음" width={24} height={24} className="shadow-2xl" />
      </CarouselNext>
    </Carousel>
  )
}
