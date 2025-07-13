"use client"

import EventList from "@/components/event/EventList"


import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PostCardSkeleton from "@/components/post/PostSkeleton";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/post/PostCard";
import { IPost } from "@/lib/type";






interface PostsApiResponse {
    posts: IPost[]; // Array event sesuai tipe Event di atas
    total: number; // Total jumlah event
}

const POSTS_PER_PAGE = 4;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchPosts(context: QueryFunctionContext) {
    //  const [_key] =  context.queryKey;

    const pageParam = context.pageParam
    // const offset = (Number(pageNum) - 1) * Number(limit);

    const url = `/api/posts?limit=${POSTS_PER_PAGE}&offset=${pageParam}`;

    // Perbaiki URL untuk menyertakan query parameters
    // const url = `/api/posts`;

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memuat event.");
    }
    const data: PostsApiResponse = await response.json(); // Cast data ke tipe yang benar
    return data;
}


export default function Dashboard() {

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        // isError,
        // error,
    } = useInfiniteQuery<PostsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
        queryKey: ["posts",],
        queryFn: fetchPosts,
        initialPageParam: 0,

        // `getNextPageParam` akan tetap bekerja dengan baik karena ia hanya melihat panjang `posts`
        // dari `lastPage`
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.posts.length < 4) {
                return undefined; // Tidak ada lagi halaman jika jumlah post kurang dari yang diharapkan
            }
            return allPages.length * 4; // Offset untuk halaman berikutnya
        },
        refetchOnWindowFocus: true,

    });
    const posts = data?.pages.flatMap((page) => page.posts) || [];
    return (
        <>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 lg:space-y-6 overflow-y-auto lg:max-w-2xl xl:max-w-4xl mx-auto mb-20">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
                    ) : posts.length === 0 ? (
                        <div className="text-center p-4 text-gray-500">Postingan tidak ditemukan.</div>
                    ) : (
                        posts.map((post, i) => <PostCard index={i} key={i} post={post} />)
                    )}

                    {/* Load More Button */}
                    {/* Tombol akan muncul hanya jika hasNextPage true */}
                    {hasNextPage && (
                        <div className="flex justify-center mt-8">
                            <Button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat lebih banyak data...
                                    </>
                                ) : (
                                    "Load More Posts"
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Pesan opsional saat semua post dimuat */}
                    {!hasNextPage && posts.length > 0 && (
                        <div className="text-center text-gray-500 mt-8">Anda telah pada akhir postingan.</div>
                    )}
                </div>
            </main>

            {/* EventList: Tetap kanan */}
            <aside className=" shrink-0 overflow-y-auto border-l sticky h-[calc(100vh-64px)]">
                <EventList />
            </aside>
        </>
    )
}
