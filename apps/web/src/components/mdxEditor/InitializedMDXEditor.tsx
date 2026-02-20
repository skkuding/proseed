'use client'

import type { ForwardedRef } from 'react'
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  codeBlockPlugin,
  type CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  markdownShortcutPlugin,
} from '@mdxeditor/editor'

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  match: () => true,
  priority: 0,
  Editor: ({ code }) => {
    const cb = useCodeBlockEditorContext()
    return (
      <textarea
        className="w-full rounded border p-2 font-mono"
        defaultValue={code}
        onChange={(e) => cb.setCode(e.target.value)}
      />
    )
  },
}

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      ref={editorRef}
      plugins={[
        codeBlockPlugin({
          codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor],
        }),
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
      ]}
      {...props}
    />
  )
}
