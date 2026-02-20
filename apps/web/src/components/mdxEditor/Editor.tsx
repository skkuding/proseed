'use client'

import { useRef } from 'react'
import type { MDXEditorMethods } from '@mdxeditor/editor'
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  CodeToggle,
  InsertCodeBlock,
  InsertImage,
  InsertThematicBreak,
  toolbarPlugin,
} from '@mdxeditor/editor'
import { ForwardRefEditor } from './ForwardRefEditor'

interface EditorProps {
  initialMarkdown?: string
  onSave?: (markdown: string) => void
}

export default function Editor({ initialMarkdown = '', onSave }: EditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null)

  const handleSave = () => {
    const markdown = editorRef.current?.getMarkdown()
    if (!markdown) return
    onSave?.(markdown)
  }

  return (
    <div className="rounded-xl border bg-white">
      <ForwardRefEditor
        ref={editorRef}
        markdown={initialMarkdown}
        plugins={[
          toolbarPlugin({
            toolbarClassName: 'flex items-center gap-1 border-b px-2 py-1',
            toolbarContents: () => (
              <>
                <UndoRedo />

                <BoldItalicUnderlineToggles />
                <CodeToggle />

                <ListsToggle />

                <InsertCodeBlock />
                <InsertThematicBreak />
                <InsertImage />

                <button
                  onClick={handleSave}
                  className="ml-auto rounded bg-black px-3 py-1 text-sm text-white"
                >
                  저장
                </button>
              </>
            ),
          }),
        ]}
        className="min-h-75 px-4 py-3"
        placeholder="내용을 입력하세요"
      />
    </div>
  )
}
