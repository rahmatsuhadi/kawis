"use client"

import PostCard from "./PostCard"
import { useQuery } from "@tanstack/react-query";
import { IPost } from "@/types";
import { EventPost, EventPostImage, User } from "@prisma/client";

export interface PostResponse extends EventPost {
  images: EventPostImage[]
  event: {
    name: string
  }
  user: User
}


interface PostsApiResponse {
  posts: PostResponse[]; // Array event sesuai tipe Event di atas
  total: number; // Total jumlah event
}


async function fetchPosts() {
  //  const [_key, currentStatus, pageNum, limit] = queryKey;
  // const offset = (Number(pageNum) - 1) * Number(limit);

  // Perbaiki URL untuk menyertakan query parameters
  const url = `/api/posts`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal memuat event.");
  }
  const data: PostsApiResponse = await response.json(); // Cast data ke tipe yang benar
  return data;
}


export default function Post() {




  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PostsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
    queryKey: ["posts",],
    queryFn: fetchPosts,
    refetchOnWindowFocus: true,
  });
  const posts = data?.posts || [];

  return (
    <div className="space-y-4 lg:space-y-6 overflow-y-auto max-w-2xl mx-auto">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
        : posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  )



}


export function PostCardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4 border rounded-md shadow-sm bg-white">
      {/* Header skeleton (avatar & name) */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-1/3 h-4 bg-gray-200 rounded" />
          <div className="w-1/4 h-3 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Text content skeleton */}
      <div className="space-y-2">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-3/4 h-4 bg-gray-200 rounded" />
        <div className="w-2/3 h-4 bg-gray-100 rounded" />
      </div>

      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 rounded-lg" />
    </div>
  );
}
