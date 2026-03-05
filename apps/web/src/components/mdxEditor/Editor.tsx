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
}

export default function Editor({
  markdown = '',
  onChange,
  placeholder = '텍스트를 입력해주세요',
}: EditorProps) {
  return (
    <div className="min-w-231 rounded-xl border border-gray-200 bg-white">
      <ForwardRefEditor
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        plugins={[
          toolbarPlugin({
            toolbarClassName: 'flex flex-row items-center gap-1 border-b px-2 py-1',
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
        className="min-h-50 px-4 py-3"
      />
    </div>
  )
}
