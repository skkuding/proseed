'use client'

import { useState } from 'react'
import { getUploadUrl, uploadToS3 } from '@/lib/api'
import { MAX_QUESTION_IMAGES, type QuestionImageItem } from '../_components/FeedbackQuestionBox'

type ImageModal = { questionId: number; index: number } | null

export function useQuestionImages() {
  const [questionImages, setQuestionImages] = useState<Record<number, QuestionImageItem[]>>({})
  const [imageModal, setImageModal] = useState<ImageModal>(null)

  const handleImageSelect = async (questionId: number, files: FileList | null) => {
    if (!files || files.length === 0) return

    const current = questionImages[questionId]?.length ?? 0
    const remaining = MAX_QUESTION_IMAGES - current
    const selected = Array.from(files).slice(0, remaining)
    if (selected.length === 0) return

    const newImages: QuestionImageItem[] = selected.map((file) => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      uploading: true,
    }))

    setQuestionImages((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] ?? []), ...newImages],
    }))

    await Promise.all(
      selected.map(async (file, i) => {
        const imageId = newImages[i].id
        try {
          const { url, key } = await getUploadUrl(file.name, file.type)
          await uploadToS3(url, file)
          setQuestionImages((prev) => ({
            ...prev,
            [questionId]: prev[questionId].map((img) =>
              img.id === imageId ? { ...img, key, uploading: false } : img
            ),
          }))
        } catch {
          setQuestionImages((prev) => ({
            ...prev,
            [questionId]: prev[questionId].map((img) =>
              img.id === imageId ? { ...img, uploading: false } : img
            ),
          }))
        }
      })
    )
  }

  const removeImage = (questionId: number, index: number) => {
    setQuestionImages((prev) => {
      const updated = prev[questionId].filter((_, i) => i !== index)
      return { ...prev, [questionId]: updated }
    })
    setImageModal(null)
  }

  const modalImages = imageModal ? (questionImages[imageModal.questionId] ?? []) : []
  const modalImage = imageModal ? modalImages[imageModal.index] : null

  return {
    questionImages,
    imageModal,
    setImageModal,
    handleImageSelect,
    removeImage,
    modalImages,
    modalImage,
  }
}
