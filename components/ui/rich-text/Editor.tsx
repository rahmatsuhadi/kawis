"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from '@tiptap/extension-placeholder'
import Toolbar from "./tool"
// import { Toolbar } from "@/components/ui/rich-text/ToolBar"

interface EditorProps {
  content: string
  onChange(text: string): void
  placeholder?: string
  className?: string
}

 const Editor = ({ content, onChange, placeholder }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Placeholder.configure({
  placeholder,
  emptyNodeClass:
    'first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none',
}),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] w-full rounded-md border border-orange-200 focus:border-orange-500  border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="space-y-2 prose-sm prose-ol:list-decimal prose-ul:list-disc">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor