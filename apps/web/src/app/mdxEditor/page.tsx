import Editor from '@/components/mdxEditor/Editor'

export default function EditorPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">MDX Editor</h1>
      <div className="flex gap-4 flex-wrap">
        <Editor />
      </div>
    </main>
  )
}
