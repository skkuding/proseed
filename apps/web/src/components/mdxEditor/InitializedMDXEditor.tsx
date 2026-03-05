'use client'

import '@mdxeditor/editor/style.css'
import type { ForwardedRef } from 'react'
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  markdownShortcutPlugin,
} from '@mdxeditor/editor'

export default function InitializedMDXEditor({
  editorRef,
  plugins: extraPlugins = [],
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      ref={editorRef}
      plugins={[
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        markdownShortcutPlugin(),
        ...extraPlugins,
      ]}
      {...props}
    />
  )
}
