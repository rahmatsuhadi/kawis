"use client"
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ImageIcon, Loader2, Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadImage } from "@/lib/image-service";
import Image from "next/image";
import getInitialName from "@/lib/getInitialName";

export default function CardCreatePost({ eventId }: { eventId: string }) {
  const { data: session, } = useSession();
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]); // Array to store File objects
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]); // Array to store object URLs for preview
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  const queryClient = useQueryClient(); // Initialize QueryClient

  // --- useMutation for Creating a New Post ---
  const createPostMutation = useMutation({
    mutationFn: async (postData: { eventId: string; content: string; imageUrls: string[] | null }) => { // Change imageUrl to imageUrls
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post.");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Post created!", { description: "Your post has been successfully published." });
      setNewPostContent("");
      // --- Reset image states ---
      setSelectedImageFiles([]);
      setPreviewImageUrls([]);

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postComments", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-detail", eventId] });

    },
    onError: (error) => {
      toast.error("Failed to create post", { description: error.message || "An unknown error occurred." });
    },
  });
  // --- Image Upload Handlers ---
  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Limit total images to 5
    if (selectedImageFiles.length + files.length > 5) {
      toast.error("Image Limit Reached", { description: "You can upload a maximum of 5 images." });
      return;
    }

    const newFiles = Array.from(files);
    const newPreviewUrls: string[] = [];

    // --- Create URLs for instant preview ---
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviewUrls.push(URL.createObjectURL(file));
      } else {
        toast.error("Invalid File Type", { description: `File '${file.name}' is not an image.` });
      }
    });

    setSelectedImageFiles(prev => [...prev, ...newFiles]);
    setPreviewImageUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeSelectedImage = (indexToRemove: number) => {
    // --- Clean up object URL ---
    URL.revokeObjectURL(previewImageUrls[indexToRemove]);

    setSelectedImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreviewImageUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // --- Handle Post Submission ---
  const handlePostSubmit = async () => {
    if (!session?.user?.id) {
      toast.error("Login Required", { description: "You must be logged in to create a post." });
      return;
    }
    if (newPostContent.trim() === "" && selectedImageFiles.length === 0) { // Check for multiple images
      toast.error("Empty Post", { description: "Your post cannot be empty. Please add text or an image." });
      return;
    }
    if (!eventId) {
      toast.error("Event Not Found", { description: "Post must be associated with an event." });
      return;
    }

    const uploadedImageUrls: string[] = []; // Array to store URLs from Supabase

    if (selectedImageFiles.length > 0) {
      setIsUploadingImage(true);
      const uploadToastId = toast.loading("Uploading images...", { duration: 0 });
      try {
        for (const file of selectedImageFiles) {
          const url = await uploadImage(file, 'posts'); // Upload each image to 'posts' folder
          uploadedImageUrls.push(url);
        }
        toast.dismiss(uploadToastId);
        toast.success("Images uploaded successfully!");
      } catch (error) {
        toast.dismiss(uploadToastId);
        toast.error("Image Upload Failed", { description: "Ada masalah saat proses upload gambar" });
        setIsUploadingImage(false);
        console.error("Image Upload Error:", error);
        return; // Stop post submission if image upload fails
      } finally {
        setIsUploadingImage(false);
      }
    }

    // Call the mutation
    createPostMutation.mutate({
      eventId: eventId,
      content: newPostContent,
      imageUrls: uploadedImageUrls, // Pass the array of uploaded image URLs
    });
  };

  const isPosting = createPostMutation.isPending || isUploadingImage;
  const isButtonDisabled = isPosting || !session?.user?.id || (newPostContent.trim() === "" && selectedImageFiles.length === 0); // Check for multiple images

const fileInputRef = useRef<HTMLInputElement | null>(null);
  return (
    <Card className="mb-6 shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
        <CardTitle className="text-lg text-gray-900">Share your thoughts</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || '/placeholder.jpg'} />
            <AvatarFallback className="bg-orange-100 text-orange-700">
              {getInitialName(session?.user?.name || session?.user?.name || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What are your thoughts about this event?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="mb-3 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              disabled={isPosting}
            />

            {/* --- New: Image Previews (Grid Layout) --- */}
            {previewImageUrls.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2"> {/* Grid for multiple previews */}
                {previewImageUrls.map((url, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={url}
                      alt={`Post image preview ${index + 1}`}
                      width={150} // Adjust as needed for preview thumbnails
                      height={100}
                      className="w-full h-auto object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 rounded-full h-5 w-5"
                      onClick={() => removeSelectedImage(index)}
                      disabled={isPosting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {/* Photo Upload Button (show only if less than 5 images) */}
                {selectedImageFiles.length < 5 && ( // Only show upload button if less than 5 images
                  <>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-orange-600 hover:bg-orange-50 bg-transparent h-8 w-8"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPosting || isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      multiple
                    />
                  </>
                )}
                {/* Location Button (Placeholder) */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                  disabled={isPosting}
                >
                  <MapPin className="h-4 w-4 mr-2" /> Lokasi
                </Button> */}
              </div>
              <Button
                size="sm"
                onClick={handlePostSubmit}
                disabled={isButtonDisabled}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Posting
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}