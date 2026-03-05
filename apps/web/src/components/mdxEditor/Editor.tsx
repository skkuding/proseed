'use client'

import {
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  Separator,
  StrikeThroughSupSubToggles,
  toolbarPlugin,
} from '@mdxeditor/editor'
import { ForwardRefEditor } from './ForwardRefEditor'

interface EditorProps {
  markdown?: string
  onChange?: (markdown: string) => void
  placeholder?: string
  width: string | number
  height: string | number
}

export default function Editor({
  markdown = '',
  onChange,
  placeholder = '텍스트를 입력해주세요',
  width,
  height,
}: EditorProps) {
  return (
    <div
      className="flex flex-col border border-neutral-95 rounded-xl bg-white overflow-hidden"
      style={{ width, height }}
    >
      <ForwardRefEditor
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        plugins={[
          toolbarPlugin({
            toolbarClassName:
              'flex flex-row items-center gap-1 border-b border-gray-200 bg-white! px-2 py-1 rounded-t-xl! rounded-b-none!',
            toolbarContents: () => (
              <>
                <BoldItalicUnderlineToggles />
                <StrikeThroughSupSubToggles options={['Strikethrough']} />
                <Separator />
                <ListsToggle options={['bullet', 'number']} />
                <Separator />
                <CreateLink />
              </>
            ),
          }),
        ]}
        className={height ? 'mdxeditor-fixed' : 'min-h-50'}
        contentEditableClassName="px-4 py-3"
      />
    </div>
  )
}
