"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import EmojiPicker from "./emoji-picker"

interface Reaction {
  count: number
  users: string[]
}

interface EmojiReactionsProps {
  reactions: {
    [key: string]: Reaction
  }
  userReaction: string | null
  onReactionChange: (reaction: string) => void
  showPicker?: boolean
}

const reactionEmojis = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
}

export default function EmojiReactions({
  reactions,
  userReaction,
  onReactionChange,
  showPicker = false,
}: EmojiReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Get top reactions (with count > 0)
  const topReactions = Object.entries(reactions)
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    .filter(([_, reaction]) => reaction.count > 0)
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    .sort(([_, a], [__, b]) => b.count - a.count)
    .slice(0, 3)

  const totalReactions = Object.values(reactions).reduce((sum, reaction) => sum + reaction.count, 0)

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
  }

  const handleQuickReaction = (reactionType: string) => {
    onReactionChange(reactionType)
  }

  return (
    <div className="relative">
      {/* Reaction Summary */}
      {totalReactions > 0 && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            {/* Top reaction emojis */}
            <div className="flex -space-x-1">
              
              {
              // eslint-disable-next-line  @typescript-eslint/no-unused-vars
              topReactions.map(([type, _]) => (
                <div
                  key={type}
                  className="w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm"
                >
                  {reactionEmojis[type as keyof typeof reactionEmojis]}
                </div>
              ))}
            </div>

            {/* Reaction count */}
            <span className="text-sm text-gray-600 ml-1">{formatCount(totalReactions)}</span>
          </div>

          {/* User's reaction indicator */}
          {userReaction && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
              Anda{" "}
              {userReaction === "like"
                ? "menyukai"
                : userReaction === "love"
                  ? "mencintai"
                  : userReaction === "laugh"
                    ? "tertawa"
                    : userReaction === "wow"
                      ? "terkagum"
                      : userReaction === "sad"
                        ? "sedih"
                        : userReaction === "angry"
                          ? "marah"
                          : "bereaksi"}{" "}
              ini
            </Badge>
          )}
        </div>
      )}

      {/* Quick Reaction Bar (on hover or click) */}
      {showPicker && (
        <div className="flex items-center gap-1 p-2 bg-white border rounded-lg shadow-lg mb-3">
          {Object.entries(reactionEmojis).map(([type, emoji]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110 ${
                userReaction === type ? "bg-orange-100 scale-110" : ""
              }`}
              onClick={() => handleQuickReaction(type)}
              title={`${type.charAt(0).toUpperCase() + type.slice(1)} (${reactions[type]?.count || 0})`}
            >
              <span className="text-xl">{emoji}</span>
            </Button>
          ))}

          {/* More emojis button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <span className="text-lg">➕</span>
            </Button>

            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    // Handle custom emoji reaction
                    console.log("Custom emoji:", emoji)
                    setShowEmojiPicker(false)
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Reactions (expandable) */}
      {totalReactions > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(reactions)
          // eslint-disable-next-line  @typescript-eslint/no-unused-vars
            .filter(([_, reaction]) => reaction.count > 0)
            .map(([type, reaction]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className={`p-1 h-auto text-xs hover:bg-gray-100 ${
                  userReaction === type ? "bg-orange-100 text-orange-600" : "text-gray-600"
                }`}
                onClick={() => handleQuickReaction(type)}
              >
                <span className="mr-1">{reactionEmojis[type as keyof typeof reactionEmojis]}</span>
                <span>{reaction.count}</span>
              </Button>
            ))}
        </div>
      )}
    </div>
  )
}
