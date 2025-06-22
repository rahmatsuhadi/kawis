"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"
import { deleteImage, uploadImage } from "@/lib/image-service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Event } from "@prisma/client"
import { useRouter } from "next/navigation"
import Editor from "../ui/rich-text/Editor"


export default function FormCreatePost({ event }: { event: Event }) {

    const [postContent, setPostContent] = useState("")
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // Hanya satu gambar per post
    const [isUploading, setIsUploading] = useState(false); // State untuk upload gambar
    const queryClient = useQueryClient();
    const router = useRouter()


    // --- useMutation untuk Membuat Postingan Baru ---
    const createPostMutation = useMutation({
        mutationFn: async (newPostData: { eventId: string; content: string; imageUrl: string | null }) => {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPostData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal membuat postingan.");
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success("Postingan Berhasil Dibuat!", {
                description: "Postingan Anda telah berhasil dipublikasikan.",
            });
            // Invalidasi cache yang relevan
            if (event.id) {
                queryClient.invalidateQueries({ queryKey: ["event-detail", event.id] }); // Update detail event
            }
            queryClient.invalidateQueries({ queryKey: ["event-posts"] }); // Jika ada daftar postingan terpisah

            // Reset form
            setPostContent("");
            setUploadedImageUrl(null);

            // Redirect ke halaman detail event atau halaman utama
            if (event.id) {
                router.push(`/main/event/${event.id}`);
            } else {
                router.push('/main'); // Fallback jika tidak ada eventId
            }
        },
        onError: (error) => {
            toast.error("Gagal Membuat Postingan", {
                description: error.message || "Terjadi kesalahan saat membuat postingan.",
            });
        },
    });


    // --- Fungsi Upload Gambar (Menggunakan Image Service) ---
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (uploadedImageUrl) { // Hanya izinkan 1 gambar per post
            toast.error("Hanya 1 Gambar", { description: "Anda hanya dapat mengunggah satu gambar per postingan." });
            return;
        }

        setIsUploading(true);
        const uploadToastId = toast.loading("Mengunggah gambar...");

        try {
            const imageUrl = await uploadImage(file); // Panggil fungsi upload dari service utility
            console.log(imageUrl,)
            setUploadedImageUrl(imageUrl);
            toast.dismiss(uploadToastId);
            toast.success("Gambar berhasil diunggah!");
        } catch (error) {
            toast.dismiss(uploadToastId);
            toast.error("Gagal Mengunggah Gambar", {
                description: "Terjadi kesalahan saat mengunggah gambar.",
            });
            console.error("Upload Error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = async () => {
        if (!uploadedImageUrl) return;

        try {
            await deleteImage(uploadedImageUrl); // Panggil fungsi delete dari service utility
            setUploadedImageUrl(null);
            toast.info("Gambar berhasil dihapus.");
        } catch (error) {
            toast.error("Gagal Menghapus Gambar", {
                description: "Terjadi kesalahan saat menghapus gambar.",
            });
            console.error("Delete Error:", error);
        }
    };


    const handlePostNow = () => {
        // Validasi dasar
        if (!event.id) { // Pastikan ID event yang akan dikirim itu ada
            toast.error("Pilih Event", { description: "Event terkait tidak ditemukan." });
            return;
        }
        if (!postContent.trim() && !uploadedImageUrl) {
            toast.error("Konten Kosong", { description: "Postingan harus memiliki konten atau gambar." });
            return;
        }

        const postData = {
            eventId: event.id, // Gunakan ID event yang sudah valid
            content: postContent,
            imageUrl: uploadedImageUrl,
        };

        createPostMutation.mutate(postData);
    };


 const plainTextContent = postContent.replace(/<[^>]*>/g, '');
    const finalRenderedContent = { __html: plainTextContent };
    const selectedEventName = event.name
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Image Upload Section */}
            <div className="space-y-4">
                <Label className="text-sm lg:text-base font-medium">Unggah gambar</Label>
                {uploadedImageUrl ? (
                    <div className="relative">
                        <Card className="overflow-hidden">
                            <Image
                                src={uploadedImageUrl || "/placeholder.jpg"}
                                alt="Uploaded image"
                                width={600}
                                height={400}
                                className="w-full h-60 lg:h-80 object-cover"
                            />
                        </Card>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 w-6 lg:w-8 h-6 lg:h-8 rounded-full p-0"
                            onClick={removeImage}
                        >
                            <X className="w-3 lg:w-4 h-3 lg:h-4" />
                        </Button>
                    </div>
                ) : (
                    <label className="cursor-pointer">
                        <Card className="border-2 border-dashed border-orange-300 hover:border-orange-500 transition-colors">
                            <CardContent className="p-8 lg:p-12">
                                <div className="flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-12 lg:w-16 h-12 lg:h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Upload className="w-6 lg:w-8 h-6 lg:h-8 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-base lg:text-lg font-medium text-gray-700">Upload Image</p>
                                        <p className="text-xs lg:text-sm text-gray-500 mt-1">
                                            Click to select an image from your device
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                )}
            </div>

            {/* Post Details Section */}
            <div className="space-y-4 lg:space-y-6">
                {/* Event Selection */}
                <div className="space-y-2">
                    <Label className="text-sm lg:text-base font-medium">Event Terkait <span className="text-red-500">*</span></Label>
                    <div className="w-full px-4 py-2 border border-orange-200 rounded-md bg-gray-100 text-gray-700 text-sm lg:text-base">
                        {selectedEventName ?? "Belum dipilih"}

                    </div>
                    {/* Jika Anda ingin memberikan opsi untuk memilih event lain (jika tidak dari URL), Anda bisa menambahkannya di sini */}
                    <p className="text-xs text-gray-500 mt-1">Ini adalah event yang Anda pilih. Jika salah, kembali ke halaman event untuk memilih yang lain.</p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm lg:text-base font-medium">
                        Konten
                    </Label>
                    <Editor placeholder="Apa yang ada pikirkan?" content={postContent} onChange={(e) => setPostContent(e)} />
                    {/* <Textarea
                        id="content"
                        placeholder="Apa yang ada pikirkan?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="min-h-32 lg:min-h-40 border-orange-200 focus:border-orange-500 resize-none"
                    /> */}
                </div>

                {/* Post Preview */}
                <Card className="bg-gray-50">
                    <CardContent className="p-4">
                        <h4 className="font-medium mb-3 text-xs lg:text-sm text-gray-600">Preview Post</h4>
                        <div className="space-y-2 text-xs lg:text-sm">
                            <div>
                                <span className="font-medium">Event:</span>
                                <p className="text-gray-600">{"Belum dipilih"}</p>
                            </div>
                            <div>
                                <span className="font-medium">Content:</span>
                                <div className="text-gray-60 prose dark:prose-invert max-w-none" // Tambahkan kelas 'prose' untuk styling default HTML (jika Anda pakai Tailwind Typography)
                                    dangerouslySetInnerHTML={finalRenderedContent}
                                ></div>
                            </div>
                            <div>
                                <span className="font-medium">Image:</span>
                                <p className="text-gray-600">{uploadedImageUrl ? "1 gambar" : "Belum ada gambar"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Post Button */}
                <Button
                    onClick={handlePostNow}
                    disabled={!postContent.trim() && !uploadedImageUrl || isUploading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 lg:py-3 text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Post Now
                </Button>
            </div>
        </div>
    )
}