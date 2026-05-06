interface FeedbackCardProps {
  title?: string
  content?: string
  author?: string
}

export default function FeedbackCard({
  title = '아이디어 단계의 제품 구조를 조금만 더 정돈하면 더 좋아질 것 같아요.',
  content = '피드백 내용이 들어갈 자리입니다. 나중에 실제 데이터로 바꾸면 됩니다.',
  author = 'DINGDONG',
}: FeedbackCardProps) {
  return (
    <article className="flex min-h-[180px] flex-col justify-between rounded-[20px] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-black">{title}</h3>
        <p className="text-sm leading-6 text-gray-500">{content}</p>
      </div>

      <div className="mt-4 text-xs text-gray-400">{author}</div>
    </article>
  )
}
