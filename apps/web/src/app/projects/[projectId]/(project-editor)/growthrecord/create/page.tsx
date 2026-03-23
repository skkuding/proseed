'use client'

import { Suspense } from 'react'
import { GrowthRecordForm } from '../../../_components/GrowthRecordForm'

export default function CreateGrowthRecord() {
  return (
    <Suspense>
      <GrowthRecordForm />
    </Suspense>
  )
}
