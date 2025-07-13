"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {Heart, MessageSquare, Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { PostResponse } from '@/app/main/page';
import { CommentApiResponse } from './PostCard';
import getInitialName from '@/lib/getInitialName';

// Assuming these types are defined and accessible (e.g., in lib/api/posts-api.ts or global types)
// Also assuming getInitialName is defined in lib/utils
// Props for the PostDetailModal
interface PostDetailModalProps {
  isOpen: boolean; // Controls if the modal is open
  onOpenChange: (open: boolean) => void; // Callback when modal open state changes
  initialPost: PostResponse; // The post data clicked from the main feed
}

// Function to fetch full post details if not already complete (e.g., comments not included in main list)
// You might already have a /api/posts/[id] endpoint, if so, use that.
// If your /api/posts endpoint returns full details, this fetcher might be redundant.
async function fetchFullPostDetails(postId: string): Promise<PostResponse> {
  const response = await fetch(`/api/posts/${postId}`); // Assuming you have /api/posts/[id] API
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to load post details.");
  }
  return response.json();
}


export function PostDetailModal({ isOpen, onOpenChange, initialPost }: PostDetailModalProps) {
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const [newCommentContent, setNewCommentContent] = useState("");  
  // --- New: State to manage the currently displayed image index ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 


  
  // --- useMutation for Comments ---
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { postId: string; content: string }) => {
      const response = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(commentData), });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || "Failed to send comment."); }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Comment sent!", { duration: 2000 });
      setNewCommentContent("");
      queryClient.invalidateQueries({ queryKey: ["postComments", post.id] }); // Invalidate general comments
      queryClient.invalidateQueries({ queryKey: ["postDetail", post.id] }); // Invalidate post detail to refresh comments
    },
    onError: (error) => { toast.error("Failed to send comment", { description: error.message || "An error occurred." }); },
  });

  const handlePostComment = () => {
    if (!session?.user?.id) { toast.error("Login Required", { description: "You must be logged in to comment." }); return; }
    if (newCommentContent.trim() === "") { toast.error("Empty Comment", { description: "Comment cannot be empty." }); return; }
    createCommentMutation.mutate({ postId: post.id, content: newCommentContent });
  };

  // --- useMutation for Like/Unlike ---
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      const method = isLikedByUser ? "DELETE" : "POST";
      const response = await fetch(`/api/posts/${post.id}/like`, { method: method, });
      if (!response.ok) { const errorData = await response.json(); if (response.status === 409) { throw new Error("You have already performed this action."); } throw new Error(errorData.message || `Failed to ${isLikedByUser ? "unlike" : "like"} post.`); }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postLikeStatus", post.id, session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Invalidate main posts list
      queryClient.invalidateQueries({ queryKey: ["postDetail", post.id] }); // Invalidate post detail
      toast.success(isLikedByUser ? "Unlike successful!" : "Post liked!");
    },
    onError: (error) => { toast.error("Like operation failed", { description: error.message || "An error occurred." }); },
  });

  const handleToggleLike = () => {
    if (!session?.user?.id) { toast.error("Login Required", { description: "You must be logged in to like posts." }); return; }
    toggleLikeMutation.mutate();
  };


  // Reset currentImageIndex when modal opens for a new post or closes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0); // Reset to first image when modal opens
    }
  }, [isOpen, initialPost.id])

  // Use useQuery to fetch the full post details when the modal is opened
  // This ensures we have the most up-to-date info, especially for comments/likes
  const {
    data: post,
    isLoading: isLoadingPostDetails,
    isError: isErrorPostDetails,
    error: postDetailsError,
  } = useQuery<PostResponse, Error>({
    queryKey: ["postDetail", initialPost.id], // Unique key for this specific post detail
    queryFn: ({ queryKey }) => fetchFullPostDetails(queryKey[1] as string),
    enabled: isOpen, // Only fetch when the modal is open
    staleTime: 1000 * 60, // Cache post details for 1 minute

    initialData: initialPost, // Use initial data to instantly show content
    initialDataUpdatedAt: initialPost.createdAt ? new Date(initialPost.createdAt).getTime() : 0, // Mark initial data as "stale" from its creation
  });



  // --- React Query untuk Mengambil Komentar ---
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isError: isErrorComments,
    // error: commentsError,
  } = useQuery<CommentApiResponse, Error>({
    queryKey: ["postComments", post.id], // Kunci unik untuk komentar per post
    queryFn: async ({ queryKey }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_key, postId] = queryKey;
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal memuat komentar.");
      }
      return res.json();
    },
    enabled:isOpen, // Hanya fetch komentar jika `showComments` true (saat tombol komentar diklik)
    staleTime: 1000 * 10, // Komentar dianggap stale setelah 10 detik

  });

    const comments = commentsData?.comments || [];
    // Komentar terakhir untuk ditampilkan saat list komentar disembunyikan
    // const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

  // Handle cases where post data is not yet available or failed to load
  if (!post && isLoadingPostDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <p className="ml-4 text-lg">Loading post details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isErrorPostDetails || !post) {
    // If error or post not found after loading
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[40vh]">
          <div className="flex flex-col justify-center items-center h-full text-red-600">
            <X className="h-10 w-10 mb-4" />
            <p className="text-lg">Failed to load post: {(postDetailsError as Error)?.message || "Post not found."}</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // --- Start: Logic for Likes and Comments (Copied from PostCard) ---
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: id });


  const isLikedByUser = post.postLike ? !!post.postLike.find(like => like.userId === session?.user?.id) : false || false; // Status like oleh user saat ini

  const isCommentInputDisabled = createCommentMutation.isPending || sessionStatus === "loading" || sessionStatus === "unauthenticated";
  const isLikeButtonDisabled = toggleLikeMutation.isPending || sessionStatus === "loading" || sessionStatus === "unauthenticated";

  // --- End: Logic for Likes and Comments ---

  const renderPostContent = (htmlContent: string) => ({ __html: htmlContent });
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className=" p-0 h-[90vh] flex flex-col ">
        {/* Left Side: Image Carousel / Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-xl font-bold truncate">{post.event.name}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 truncate">
              by {post.user.name || post.user.username} - {timeAgo}
            </DialogDescription>
          </DialogHeader>

          {/* Main Post Image (or first image from array) */}
          {post.images && post.images.length > 0 && (
            <div className="relative flex-1 w-full max-h-[60%] lg:max-h-full overflow-hidden bg-black flex items-center justify-center">
              <Image
                src={post.images[currentImageIndex] || "/placeholder.jpg"}
                alt={`Post image for ${post.event.name}`}
                layout="fill"
                objectFit="contain" // Use contain to fit image within bounds without cropping
                className="rounded-t-lg"
              />
            </div>
          )}

         {/* Post Images Thumbnail Scroll (if more than 1 image) */}
          {post.images && post.images.length > 1 && (
            <div className="p-2 flex-shrink-0 flex space-x-2 overflow-x-auto border-t bg-gray-100">
                {post.images.map((img, idx) => (
                    <div 
                        key={img || idx} 
                        className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border cursor-pointer 
                            ${idx === currentImageIndex ? 'border-orange-500 ring-2 ring-offset-2 ring-orange-500' : 'border-gray-300'}`} // Highlight active thumbnail
                        onClick={() => handleThumbnailClick(idx)} // --- New: Click handler for thumbnails ---
                    >
                        <Image src={img || "/placeholder.jpg"} alt={`Thumbnail ${idx+1}`} layout="fill" objectFit="cover" className="rounded-md" />
                    </div>
                ))}
            </div>
          )}

          {/* Post Content (Below Image) */}
          <div className="p-4 flex-shrink-0 overflow-y-auto max-h-[40%] lg:max-h-full">
            <div className="text-gray-800 text-sm prose max-w-none" dangerouslySetInnerHTML={renderPostContent(post.content)}></div>
            {/* Post Actions (inside modal) */}
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:text-red-600 ${isLikedByUser ? "text-red-500" : "text-gray-500"}`}
                onClick={handleToggleLike}
                disabled={isLikeButtonDisabled}
              >
                {toggleLikeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Heart className="w-4 h-4 mr-1" />}
                {post.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-600"
                // No toggle comments here, comments are always shown on right side
                disabled={isLoadingComments}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                {isLoadingComments ? "Loading..." : `${comments.length} Comments`}
              </Button>
              {/* <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-600">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button> */}
            </div>
          </div>
        </div>

        {/* Right Side: Comments */}
        <div className="w-full flex-shrink-0 flex flex-col border-l">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg font-bold">Comments</DialogTitle>
          </DialogHeader>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[200px]">
            {isLoadingComments ? (
              <p className="text-center text-sm text-gray-500">Loading comments...</p>
            ) : isErrorComments ? (
              <p className="text-center text-sm text-red-500">Failed to load comments.</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-gray-500">Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 items-start">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user.image || "/placeholder.svg"} />
                    <AvatarFallback>{getInitialName(comment.user.name || comment.user.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-gray-100 rounded-lg p-2">
                    <p className="font-semibold text-sm">{comment.user.name || comment.user.username}</p>
                    <p className="text-xs text-gray-600 break-words">{comment.content}</p> {/* Use break-words for long comments */}
                    <p className="text-right text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: id })}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={session?.user?.image || "/placeholder.svg"} />
                <AvatarFallback>{getInitialName(session?.user?.name as string)}</AvatarFallback>
              </Avatar>
              <Input
                placeholder={isCommentInputDisabled ? "Login to comment..." : "Add a comment..."}
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="flex-1 border-orange-200 focus:border-orange-500"
                disabled={isCommentInputDisabled}
              />
              <Button
                size="icon"
                onClick={handlePostComment}
                disabled={isCommentInputDisabled || newCommentContent.trim() === "" || createCommentMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 flex-shrink-0"
              >
                {createCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}