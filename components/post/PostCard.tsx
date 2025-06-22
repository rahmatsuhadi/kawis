"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button"
import { Heart, MessageCircle, Send, Share2, Smile } from "lucide-react"
import { PostResponse } from "./Post"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { useState } from "react"
import Image from "next/image"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { Comment, User } from "@prisma/client"
import { Badge } from "../ui/badge"
import EmojiPicker from "../ui/emoji-picker"

interface CommentPost extends Comment {
    user: User
}

interface CommentApiResponse { // Ubah nama agar lebih jelas
    comments: CommentPost[];
}
interface LikeStatusApiResponse { // Tipe respons dari API status like
    isLiked: boolean;
}

const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
}

const formatTimeAgo = (dateString: Date) => {
    return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: id,
    })
}


export default function PostCard({ post }: { post: PostResponse }) {

    const queryClient = useQueryClient(); // Untuk invalidasi dan update cache
    const { data: session } = useSession(); // Status sesi user
    const [isExpanded, setIsExpanded] = useState(false); // Untuk expand/collapse deskripsi
    const [showComments, setShowComments] = useState(false); // Untuk menampilkan/menyembunyikan komentar
    const [newCommentContent, setNewCommentContent] = useState(""); // State untuk input komentar baru

    const maxLength = 200; // Jumlah karakter sebelum dipotong


    // --- React Query untuk Mengecek Status Like User ---
    const { data: likeStatus } = useQuery<LikeStatusApiResponse, Error>({
        queryKey: ["postLikeStatus", post.id, session?.user?.id], // Kunci unik, bergantung pada post.id dan user.id
        queryFn: async ({ queryKey }) => {
            // eslint-disable-next-line  @typescript-eslint/no-unused-vars
            const [_key, postId, userId] = queryKey;
            if (!userId) return { isLiked: false }; // Jika user tidak login, anggap belum like

            // Panggil API untuk cek status like
            const res = await fetch(`/api/posts/${postId}/like?userId=${userId}`);
            if (!res.ok) {
                // Jika 404 (misal: belum like), anggap belum like
                if (res.status === 404) return { isLiked: false };
                const errData = await res.json();
                throw new Error(errData.message || "Gagal memeriksa status like.");
            }
            return res.json();
        },
        // enabled: sessionStatus === "authenticated", // Query hanya dijalankan jika user login
        staleTime: 1000 * 60 * 5, // Data dianggap "stale" setelah 5 menit
    });

    const isLikedByUser = likeStatus?.isLiked || false; // Status like oleh user saat ini


    // --- React Query untuk Mengambil Komentar ---
    const {
        data: commentsData,
        isLoading: isLoadingComments,
        // isError: isErrorComments,
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
        enabled: showComments, // Hanya fetch komentar jika `showComments` true (saat tombol komentar diklik)
        staleTime: 1000 * 10, // Komentar dianggap stale setelah 10 detik

    });

    const comments = commentsData?.comments || [];
    // Komentar terakhir untuk ditampilkan saat list komentar disembunyikan
    // const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

    // const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    //     addSuffix: true,
    //     locale: id
    // });

    // --- useMutation untuk Mengirim Komentar Baru ---
    const createCommentMutation = useMutation({
        mutationFn: async (commentData: { postId: string; content: string }) => {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal mengirim komentar.");
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success("Komentar Berhasil Dikirim!", { duration: 2000 });
            setNewCommentContent(""); // Reset input komentar
            queryClient.invalidateQueries({ queryKey: ["postComments", post.id] }); // Invalidasi cache komentar untuk post ini
        },
        onError: (error) => {
            toast.error("Gagal Mengirim Komentar", { description: error.message || "Terjadi kesalahan saat mengirim komentar." });
        },
    });

    const handlePostComment = () => {
        if (!session?.user?.id) {
            toast.error("Login Diperlukan", { description: "Anda harus login untuk berkomentar." });
            return;
        }
        if (newCommentContent.trim() === "") {
            toast.error("Komentar Kosong", { description: "Komentar tidak boleh kosong." });
            return;
        }
        createCommentMutation.mutate({ postId: post.id, content: newCommentContent });
    };


    // --- useMutation untuk Like/Unlike Post ---
    const toggleLikeMutation = useMutation({
        mutationFn: async () => {
            const method = isLikedByUser ? "DELETE" : "POST"; // Jika sudah like -> DELETE (unlike), jika belum -> POST (like)
            const response = await fetch(`/api/posts/${post.id}/like`, {
                method: method,
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Jika error 409 (Conflict), berarti sudah like/unlike dan tidak perlu pesan error terlalu keras
                if (response.status === 409) {
                    throw new Error("Anda sudah melakukan aksi ini."); // Pesan lebih user-friendly
                }
                throw new Error(errorData.message || `Gagal ${isLikedByUser ? "unlike" : "like"} postingan.`);
            }
            return response.json();
        },
        onSuccess: () => {
            // Setelah like/unlike berhasil, kita perlu memperbarui UI:
            // 1. Perbarui status `isLikedByUser` (invalidasi cache query status like)
            queryClient.invalidateQueries({ queryKey: ["postLikeStatus", post.id, session?.user?.id] });
            // 2. Perbarui jumlah `likes` pada PostCard ini dan di daftar posts (invalidasi cache posts list utama)
            queryClient.invalidateQueries({ queryKey: ["posts"] });

            // Opsi untuk update cache secara optimistik agar UI responsif lebih cepat:
            // queryClient.setQueryData<PostResponse[]>(
            //     ["posts", /*...queryKey posts list Anda jika ada filter lain*/], // Kunci posts list Anda
            //     (oldPosts) => {
            //         if (!oldPosts) return oldPosts;
            //         return oldPosts.map(p =>
            //             p.id === post.id ? { ...p, likes: data.likes } : p // data.likes dari respons API
            //         );
            //     }
            // );
            toast.success(isLikedByUser ? "Unlike berhasil!" : "Post di-like!");
        },
        onError: (error) => {
            toast.error("Operasi Like Gagal", { description: error.message || "Terjadi kesalahan." });
        },
    });

    const handleToggleLike = () => {
        if (!session?.user?.id) {
            toast.error("Login Diperlukan", { description: "Anda harus login untuk menyukai postingan." });
            return;
        }
        toggleLikeMutation.mutate(); // Panggil mutasi like/unlike
    };


    // Jika Anda masih ingin fitur "Tampilkan selengkapnya", Anda perlu logika yang lebih cerdas.
    // Ini adalah solusi dasar yang akan menampilkan semua HTML atau memotongnya (tapi memotong HTML bisa merusak tag).
    // Lebih baik, biarkan HTML tampil penuh dan atur overflow CSS jika terlalu panjang.
    // Atau, potong teks mentah sebelum jadi HTML, lalu sisipkan HTML yang dipotong.
    // Untuk kemudahan, saya akan berasumsi Anda akan menampilkan seluruh HTML untuk saat ini atau memotongnya dengan CSS.

    // Jika Anda tetap ingin fitur "Tampilkan selengkapnya" dengan HTML:
    // Ini pendekatan yang lebih aman (potong plain text dulu, baru render HTML dari yang dipotong)
    const plainTextContent = post.content.replace(/<[^>]*>/g, ''); // Menghapus tag HTML untuk perhitungan panjang
    const shouldTruncate = plainTextContent.length > maxLength;
    const truncatedContent = shouldTruncate && !isExpanded
        ? plainTextContent.slice(0, maxLength) + '...'
        : post.content; // Jika tidak dipotong, pakai HTML asli

    const finalRenderedContent = { __html: truncatedContent };

    return (
        <Card className="w-full  mx-auto bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-0">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={post.user.image || "/placeholder.jpg"} alt={String(post.user.fullName)} />
                            <AvatarFallback>{String(post.user.fullName).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-sm">{post.user.fullName}</span>
                                {post.user.emailVerified && (
                                    <Badge variant="secondary" className="w-4 h-4 p-0 bg-blue-500 text-white">
                                        ✓
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>@{post.user.username}</span>
                                <span>•</span>
                                <span>{formatTimeAgo(new Date(post.createdAt))}</span>
                                {post.event.name && (
                                    <>
                                        <span>•</span>
                                        <span>{post.event.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                    {/* Post Description */}
                    <div className="text-gray-700 mb-2 text-sm lg:text-base">
                        {/* Menggunakan dangerouslySetInnerHTML untuk merender konten HTML */}
                        <div
                            className="prose dark:prose-invert max-w-none" // Tambahkan kelas 'prose' untuk styling default HTML (jika Anda pakai Tailwind Typography)
                            dangerouslySetInnerHTML={finalRenderedContent}
                        ></div>
                    </div>
                    {shouldTruncate && ( // Tombol Show more/less hanya jika ada pemotongan
                        <button
                            className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan selengkapnya'}
                        </button>
                    )}

                    {/* Tags */}
                    {/* {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )} */}
                </div>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                    <div className="relative">
                        {post.images.length === 1 ? (
                            <div className="relative w-full h-80">
                                <Image src={post.images[0].imageUrl || "/placeholder.jpg"} alt="Post image" fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-1">
                                {post.images.slice(0, 4).map((image, index) => (
                                    <div key={index} className="relative h-40">
                                        <Image
                                            src={image.imageUrl || "/placeholder.jpg"}
                                            alt={`Post image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        {index === 3 && post.images.length > 4 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white font-semibold">+{post.images.length - 4}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Post Actions */}
                <div className="px-4 py-3">
                    {/* Emoji Reactions */}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`p-0 h-auto ${isLikedByUser ? "text-red-500" : "text-gray-600"} hover:text-red-500`}
                                onClick={handleToggleLike}
                            >
                                <Heart className={`w-5 h-5 mr-1 ${isLikedByUser ? "fill-current" : ""}`} />
                                <span className="text-sm">{post.likes}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isLoadingComments}
                                className="p-0 h-auto text-gray-600 hover:text-blue-500"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageCircle className="w-5 h-5 mr-1" />
                                <span className="text-sm">{comments.length > 0 ? `${comments.length} Komentar` : "Komentar"}</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600 hover:text-green-500">
                                <Share2 className="w-5 h-5 mr-1" />
                                <span className="text-sm">{formatNumber(1)}</span>
                            </Button>
                        </div>

                        {/* Emoji Picker */}
                        {/* {showEmojiPicker && (
                            <div className="mb-3">
                                <EmojiPicker
                                    onEmojiSelect={(emoji) => {
                                        // setUserReaction(emoji)
                                        setShowEmojiPicker(false)
                                    }}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            </div>
                        )} */}
                    </div>

                    {/* Likes Info */}
                    {post.likes > 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                            Disukai oleh <span className="font-semibold">{formatNumber(post.likes)} orang</span>
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="border-t border-gray-100">
                        {/* Existing Comments */}
                        {comments.length > 0 && (
                            <div className="max-h-60 overflow-y-auto">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="flex items-start space-x-3 px-4 py-3 border-b border-gray-50 last:border-b-0"
                                    >
                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                            <AvatarImage src={comment.user.image || "/placeholder.jpg"} alt={String(comment.user.fullName)} />
                                            <AvatarFallback>{String(comment.user.fullName).charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="font-semibold text-sm">{comment.user.fullName}</span>
                                                    <span className="text-xs text-gray-500">@{comment.user.username}</span>
                                                </div>

                                                <p className="text-sm text-gray-800">{comment.content}</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                <span>{formatTimeAgo(comment.createdAt)}</span>

                                                <button className="hover:text-blue-500">Balas</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Comment */}
                        <div className="flex items-center space-x-3 p-4">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src="/placeholder.jpg?height=32&width=32" alt="You" />
                                <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex items-center space-x-2">
                                <Input
                                    placeholder="Tulis komentar..."
                                    value={newCommentContent}
                                    onChange={(e) => setNewCommentContent(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handlePostComment()}
                                    className="flex-1 border-none bg-gray-50 focus:bg-white"
                                />
                                <EmojiPicker
                                    trigger={
                                        <Button size="sm" variant="ghost" className="p-2">
                                            <Smile className="w-4 h-4 text-gray-500" />
                                        </Button>
                                    }
                                    onEmojiSelect={(emoji) => setNewCommentContent(newCommentContent + emoji)}
                                    compact={true}
                                />
                                <Button
                                    size="sm"
                                    onClick={handlePostComment}
                                    disabled={!newCommentContent.trim()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )



    // return (
    //     <Card key={post.id} className="bg-white">
    //         <CardContent className="p-4 lg:p-6">
    //             {/* Post Header */}
    //             <div className="flex items-center justify-between mb-4">
    //                 <div className="flex items-center space-x-3 ">
    //                     <Avatar className="w-8 lg:w-16 h-8 lg:h-16 ">
    //                         {/* <AvatarImage src={post.user.image || "/placeholder.jpg?height=40&width=40"} /> */}
    //                         <AvatarFallback>{getInitialName(String(post.user.fullName))}</AvatarFallback>
    //                     </Avatar>
    //                     <div>
    //                         <h3 className="font-semibold text-sm lg:text-base">{post.user.fullName || post.user.username}</h3>
    //                         <p className="text-xs lg:text-sm text-gray-500">{timeAgo}</p>
    //                         <div className=" text-orange-700 flex gap-1 items-center mt-2">
    //                             <MapPin size={15}/>
    //                             <span className="text-sm">
    //                                 {String(post.event.name).length > 30 ? String(post.event.name).substring(0,30) + "..." : post.event.name}
    //                             </span>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <Button variant="ghost" size="sm">
    //                     <MoreHorizontal className="w-4 h-4" />
    //                 </Button>
    //             </div>

    //             {/* Post Image (jika ada) */}
    //             {post.images && post.images.length > 0 && (
    //                 <div className="mb-4 rounded-lg overflow-hidden relative w-full h-48 lg:h-64">
    //                     <Image
    //                         src={post.images[0].imageUrl || "/placeholder.jpg"}
    //                         alt="Post image"
    //                         layout="fill"
    //                         objectFit="cover"
    //                         className="rounded-lg"
    //                     />
    //                 </div>
    //             )}

    //             {/* Post Description */}
    //             <p className="text-gray-700 mb-2 text-sm lg:text-base">{displayText}</p>
    //             {shouldTruncate && (
    //                 <button
    //                     className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
    //                     onClick={() => setIsExpanded(!isExpanded)}
    //                 >
    //                     {isExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan selengkapnya'}
    //                 </button>
    //             )}

    //             {/* Post Actions */}
    //             <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100">
    //                 <Button
    //                     variant="ghost"
    //                     size="sm"
    //                     className={`hover:text-red-600 ${isLikedByUser ? "text-red-500" : "text-gray-500"}`}
    //                     onClick={handleToggleLike}
    //                     disabled={isLikeButtonDisabled}
    //                 >
    //                     {toggleLikeMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Heart className="w-4 h-4 mr-1" />}
    //                     {post.likes}
    //                 </Button>
    //                 <Button
    //                     variant="ghost"
    //                     size="sm"
    //                     className="text-gray-500 hover:text-gray-600"
    //                     onClick={() => setShowComments(!showComments)}
    //                     disabled={isLoadingComments && showComments} // Disable saat memuat komentar jika showComments true
    //                 >
    //                     <MessageSquare className="w-4 h-4 mr-1" />
    //                     {isLoadingComments ? "Memuat..." : (comments.length > 0 ? `${comments.length} Komentar` : "Komentar")}
    //                 </Button>
    //                 <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-600">
    //                     <Share2 className="w-4 h-4 mr-1" />
    //                     Share
    //                 </Button>
    //             </div>

    //             {/* Komentar Section */}
    //             <div className="space-y-3">
    //                 {/* Input Komentar Baru */}
    //                 <div className="flex items-center space-x-3 mb-4">
    //                     <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
    //                         {/* Gambar profil user yang login */}
    //                         <AvatarImage src={session?.user?.image || "/placeholder.jpg"} />
    //                         <AvatarFallback>{getInitialName(String(session?.user?.name))}</AvatarFallback>
    //                     </Avatar>
    //                     <Input
    //                         placeholder={isCommentInputDisabled ? "Login untuk berkomentar..." : "Tambahkan komentar..."}
    //                         value={newCommentContent}
    //                         onChange={(e) => setNewCommentContent(e.target.value)}
    //                         className="flex-1 border-orange-200 focus:border-orange-500"
    //                         disabled={isCommentInputDisabled}
    //                     />
    //                     <Button
    //                         size="icon"
    //                         onClick={handlePostComment}
    //                         disabled={isCommentInputDisabled || newCommentContent.trim() === "" || createCommentMutation.isPending}
    //                         className="bg-orange-500 hover:bg-orange-600"
    //                     >
    //                         {createCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
    //                     </Button>
    //                 </div>

    //                 {/* Tampilan Komentar */}
    //                 {showComments ? (
    //                     isLoadingComments ? (
    //                         <p className="text-center text-sm text-gray-500">Memuat komentar...</p>
    //                     ) : isErrorComments ? (
    //                         <p className="text-center text-sm text-red-500">Gagal memuat komentar.</p>
    //                     ) : comments.length === 0 ? (
    //                         <p className="text-center text-sm text-gray-500">Belum ada komentar.</p>
    //                     ) : (
    //                         comments.map((comment) => (
    //                             <div key={comment.id} className="flex space-x-3">
    //                                 <Avatar className="w-6 lg:w-8 h-6 lg:h-8">
    //                                     <AvatarImage src={comment.user.image || "/placeholder.jpg"} />
    //                                     <AvatarFallback>{getInitialName(String(comment.user.fullName))}</AvatarFallback>
    //                                 </Avatar>
    //                                 <div className="flex-1 bg-gray-100 rounded-lg p-2">
    //                                     <p className="font-semibold text-xs lg:text-sm">{comment.user.fullName || comment.user.username}</p>
    //                                     <p className="text-xs lg:text-sm text-gray-600">{comment.content}</p>
    //                                     <p className="text-right text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: id })}</p>
    //                                 </div>
    //                             </div>
    //                         ))
    //                     )
    //                 ) : (
    //                     // Tampilkan komentar terakhir saat tersembunyi
    //                     latestComment && (
    //                         <div className="flex space-x-3 border-t pt-3">
    //                             <Avatar className="w-6 lg:w-8 h-6 lg:h-8">
    //                                 <AvatarImage src={latestComment.user.image || "/placeholder.jpg"} />
    //                                 <AvatarFallback>{getInitialName(String(latestComment.user.fullName))}</AvatarFallback>
    //                             </Avatar>
    //                             <div className="flex-1 bg-gray-100 rounded-lg p-2">
    //                                 <p className="font-semibold text-xs lg:text-sm">{latestComment.user.fullName || latestComment.user.username}</p>
    //                                 <p className="text-xs lg:text-sm text-gray-600">{latestComment.content}</p>
    //                                 <p className="text-right text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(latestComment.createdAt), { addSuffix: true, locale: id })}</p>
    //                             </div>
    //                         </div>
    //                     )
    //                 )}
    //                 {/* Pesan jika tidak ada komentar sama sekali (dan tidak menampilkan komentar) */}
    //                 {!showComments && !latestComment && comments.length === 0 && (
    //                     <p className="text-center text-sm text-gray-500">Jadilah yang pertama berkomentar!</p>
    //                 )}
    //             </div>
    //         </CardContent>
    //     </Card>
    // )
}