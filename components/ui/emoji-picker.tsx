"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Clock, Smile, Heart, Zap, Flag } from "lucide-react"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose?: () => void
  trigger?: React.ReactNode
  compact?: boolean
  showReactions?: boolean
}

// Emoji categories
const emojiCategories = {
  recent: {
    name: "Terbaru",
    icon: Clock,
    emojis: ["😀", "❤️", "👍", "😂", "😍", "🔥", "👏", "🎉"],
  },
  reactions: {
    name: "Reaksi",
    icon: Heart,
    emojis: ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🔥", "💯", "🎉", "😍", "🤔"],
  },
  smileys: {
    name: "Smiley",
    icon: Smile,
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
    ],
  },
  gestures: {
    name: "Gesture",
    icon: Zap,
    emojis: [
      "👍",
      "👎",
      "👌",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👏",
      "🙌",
      "🤲",
      "🤝",
      "🙏",
    ],
  },
  objects: {
    name: "Objek",
    icon: Flag,
    emojis: [
      "🎉",
      "🎊",
      "🎈",
      "🎁",
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🎾",
      "🏐",
      "🏉",
      "🎱",
      "🏓",
      "🏸",
      "🥅",
      "🎯",
      "⛳",
      "🏌️",
      "🎣",
      "🎿",
    ],
  },
}

// Popular reactions for quick access
const quickReactions = [
  { emoji: "👍", name: "like" },
  { emoji: "❤️", name: "love" },
  { emoji: "😂", name: "laugh" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😡", name: "angry" },
]

export default function EmojiPicker({
  onEmojiSelect,
  onClose,
  trigger,
  compact = false,
  showReactions = false,
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("recent")
  const [recentEmojis, setRecentEmojis] = useState<string[]>(["😀", "❤️", "👍", "😂", "😍", "🔥", "👏", "🎉"])
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)

    // Add to recent emojis
    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e !== emoji)
      return [emoji, ...filtered].slice(0, 8)
    })

    if (!compact) {
      setIsOpen(false)
      onClose?.()
    }
  }

  const filteredEmojis = searchQuery
    ? Object.values(emojiCategories).flatMap((category) =>
        category.emojis.filter((emoji) => emoji.includes(searchQuery.toLowerCase())),
      )
    : emojiCategories[activeCategory as keyof typeof emojiCategories]?.emojis || []

  // Quick reactions component
  const QuickReactions = () => (
    <div className="flex items-center justify-center gap-2 p-2 bg-white border rounded-lg shadow-lg">
      {quickReactions.map((reaction) => (
        <Button
          key={reaction.name}
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => handleEmojiClick(reaction.emoji)}
        >
          <span className="text-xl">{reaction.emoji}</span>
        </Button>
      ))}
    </div>
  )

  // Compact picker for comments
  const CompactPicker = () => (
    <div ref={pickerRef} className="relative">
      {!isOpen && trigger && <div onClick={() => setIsOpen(true)}>{trigger}</div>}

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <Card className="w-64 shadow-lg">
            <CardContent className="p-2">
              <div className="grid grid-cols-8 gap-1">
                {recentEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 hover:bg-gray-100"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    <span className="text-lg">{emoji}</span>
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => setIsOpen(false)}>
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  // Full picker for reactions
  const FullPicker = () => (
    <div ref={pickerRef}>
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari emoji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-gray-50 focus:bg-white text-sm"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!searchQuery && (
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-5 w-full">
                {Object.entries(emojiCategories).map(([key, category]) => {
                  const IconComponent = category.icon
                  return (
                    <TabsTrigger key={key} value={key} className="p-2">
                      <IconComponent className="w-4 h-4" />
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {Object.entries(emojiCategories).map(([key, category]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <div className="p-3">
                    <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                      {(key === "recent" ? recentEmojis : category.emojis).map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-8 hover:bg-gray-100 rounded"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          <span className="text-lg">{emoji}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {searchQuery && (
            <div className="p-3">
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {filteredEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 hover:bg-gray-100 rounded"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    <span className="text-lg">{emoji}</span>
                  </Button>
                ))}
              </div>
              {filteredEmojis.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">Emoji tidak ditemukan</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Return quick reactions for hover
  if (showReactions) {
    return <QuickReactions />
  }

  // Return compact picker for comments
  if (compact) {
    return <CompactPicker />
  }

  // Return full picker for main reactions
  return <FullPicker />
}
