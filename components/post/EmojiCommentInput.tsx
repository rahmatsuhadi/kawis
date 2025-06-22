"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Smile } from "lucide-react"
import EmojiPicker from "../ui/emoji-picker"

interface EmojiCommentInputProps {
  onSubmit: (comment: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function EmojiCommentInput({
  onSubmit,
  placeholder = "Tulis komentar...",
  disabled = false,
}: EmojiCommentInputProps) {
  const [comment, setComment] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment)
      setComment("")
      setShowEmojiPicker(false)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current
    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      const newComment = comment.slice(0, start) + emoji + comment.slice(end)
      setComment(newComment)

      // Set cursor position after emoji
      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setComment(comment + emoji)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative flex items-center space-x-2">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="pr-10 border-none bg-gray-50 focus:bg-white"
        />

        {/* Emoji Button */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="p-1 h-auto"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-4 h-4 text-gray-500" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} compact={true} />
          </div>
        )}
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSubmit}
        disabled={!comment.trim() || disabled}
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 text-white px-3"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}
