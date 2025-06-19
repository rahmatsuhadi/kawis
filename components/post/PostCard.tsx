"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button"
import { Heart, LocateIcon, MapPin, MessageSquare, MoreHorizontal, Share2 } from "lucide-react"
import { PostResponse } from "./Post"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import getInitialName from "@/lib/getInitialName"
import { useState } from "react"
import { Badge } from "../ui/badge"





export default function PostCard({ post }: { post: PostResponse }) {
    const comments = [
        { user: "Mira Sartika", text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Ut enim sunt elit." },
        { user: "Mira Sartika", text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Ut enim sunt elit." },
    ]


    const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: id
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 200; // jumlah karakter sebelum tombol "Show more"

    const shouldTruncate = post.content.length > maxLength;
    const displayText = isExpanded || !shouldTruncate
        ? post.content
        : post.content.slice(0, maxLength) + '...';

    return (
        <Card key={post.id} className="bg-white">
            <CardContent className="p-4 lg:p-6">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 ">
                        <Avatar className="w-8 lg:w-16 h-8 lg:h-16 ">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>{getInitialName(post.user.fullName as string)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-sm lg:text-base">{post.user.fullName}</h3>
                            <p className="text-xs lg:text-sm text-gray-500">{timeAgo}</p>
                            <div className=" text-orange-700 flex gap-1 items-center mt-2">
                                <MapPin size={15}/><span className="text-sm">{String(post.event.name).length>30 ? String(post.event.name).substring(0,30) + "..." : post.event.name}</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>

                {/* Post Image */}
                <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                        src={post.images[0].imageUrl || "/placeholder.svg"}
                        alt="Post image"
                        width={400}
                        height={300}
                        className="w-full h-48 lg:h-64 object-cover"
                    />
                </div>

                {/* Post Description */}
                <p className="text-gray-700 mb-2 text-sm lg:text-base">{displayText}</p>
                {shouldTruncate && (
                    <button
                        className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan selengkapnya'}
                    </button>
                )}

                {/* Post Actions */}
                <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                        <Heart className="w-4 h-4 mr-1" />
                        {11}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-600">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-600">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                    </Button>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                    {comments.map((comment, index) => (
                        <div key={index} className="flex space-x-3">
                            <Avatar className="w-6 lg:w-8 h-6 lg:h-8">
                                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                <AvatarFallback>MS</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-xs lg:text-sm">{comment.user}</p>
                                <p className="text-xs lg:text-sm text-gray-600">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}