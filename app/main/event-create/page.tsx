"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Users, DollarSign, ImageIcon, Plus, X, Clock, Tag, Eye, CalendarIcon } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Category } from "@prisma/client" // Assuming Category is from Prisma types
import { MultiSelect } from "@/components/ui/multi-select"
import Editor from "@/components/ui/rich-text/Editor" // For rich text description
import Image from "next/image"
import { deleteImage, uploadImage } from "@/lib/image-service" // Your image service utility
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { id } from "date-fns/locale" // For Indonesian locale in date formatting
import { Calendar } from "@/components/ui/calendar" // Your Shadcn UI Calendar
import GeolocationMap from "@/components/interaktif-maps/LocationMapInput" // Your map input component
import { useRouter } from "next/navigation"
import { combineDateAndTime, timeOptions } from "@/lib/generateTime"

// Maximum images allowed for upload
const MAX_IMAGES = 5;

export default function CreateEventPage() {
    // --- Form States ---
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [locationName, setLocationName] = useState<string>(""); // Corresponds to 'location' in schema
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [startTime, setStartTime] = useState<string>("09:00");
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [endTime, setEndTime] = useState<string>("17:00");
    const [price, setPrice] = useState<string>(""); // Still string for input
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [tags, setTags] = useState<string[]>([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false); // State for image upload progress
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [anonymousName, setAnonymousName] = useState<string>(""); // Required by schema
    const [organizerName, setOrganizerName] = useState<string>(""); // Optional, per schema

    // --- Multi-step form management ---
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const queryClient = useQueryClient();
    const router = useRouter();

    // --- Tag Management ---
    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // --- Step Navigation ---
    const nextStep = () => {
        // Add validation for each step before proceeding
        if (step === 1) {
            if (!title || !description || !selectedCategoryIds.length || !uploadedImageUrls.length) {
                toast.error("Form Belum Lengkap", {
                    description: "Mohon isi Judul, Deskripsi, pilih Kategori, dan unggah setidaknya satu Gambar.",
                });
                return;
            }
        } else if (step === 2) {
            if (!startDate || !endDate || !startTime || !endTime || !locationName || !address || !coordinates) {
                toast.error("Form Belum Lengkap", {
                    description: "Mohon isi semua informasi Waktu & Lokasi, termasuk titik koordinat.",
                });
                return;
            }
            if (!validateDateTime()) {
                toast.error("Kesalahan Waktu", {
                    description: "Tanggal dan waktu selesai harus setelah tanggal dan waktu mulai.",
                });
                return;
            }
        } else if (step === 3) {
            if (isPaid && (!price || parseFloat(price) <= 0)) {
                toast.error("Form Belum Lengkap", {
                    description: "Mohon masukkan harga yang valid untuk event berbayar.",
                });
                return;
            }
            if (!anonymousName.trim()) { // anonymousName is mandatory
                toast.error("Form Belum Lengkap", {
                    description: "Mohon masukkan Nama Anonim/Penyelenggara.",
                });
                return;
            }
        }

        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    // --- Image Upload & Delete Handlers ---
    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const filesToUpload = Array.from(files).slice(0, MAX_IMAGES - uploadedImageUrls.length);

        if (filesToUpload.length === 0) {
            toast.info("Batas Gambar Tercapai", {
                description: `Anda sudah mengunggah jumlah maksimum gambar (${MAX_IMAGES}).`,
            });
            return;
        }

        setIsUploading(true);
        const uploadToastId = toast.loading("Mengunggah gambar...");
        const newUploadedUrls: string[] = [];
        let uploadSuccessCount = 0;
        let uploadFailedCount = 0;

        for (const file of filesToUpload) {
            // Client-side validation for file size and type
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error(`File "${file.name}" terlalu besar (maks 10MB).`, { id: uploadToastId });
                uploadFailedCount++;
                continue;
            }
            if (!['image/png', 'image/jpeg', 'image/webp', 'image/jpg'].includes(file.type)) {
                toast.error(`File "${file.name}" bukan format gambar yang didukung (PNG, JPG, WEBP).`, { id: uploadToastId });
                uploadFailedCount++;
                continue;
            }

            try {
                const imageUrl = await uploadImage(file, "event-images"); // Your uploadImage utility
                newUploadedUrls.push(imageUrl);
                uploadSuccessCount++;
            } catch (error) {
                console.error("Upload Error:", error);
                toast.error(`Gagal mengunggah ${file.name}.`, { id: uploadToastId, description: error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui." });
                uploadFailedCount++;
            }
        }

        setUploadedImageUrls((prevUrls) => [...prevUrls, ...newUploadedUrls]);
        setIsUploading(false); // Set to false after all uploads are attempted

        toast.dismiss(uploadToastId); // Dismiss initial loading toast
        if (uploadSuccessCount > 0) {
            toast.success(`${uploadSuccessCount} gambar berhasil diunggah!`);
        }
        if (uploadFailedCount > 0) {
            toast.error(`${uploadFailedCount} gambar gagal diunggah.`);
        }
    };

    const removeImage = async (index: number) => {
        const imageUrlToRemove = uploadedImageUrls[index];

        try {
            await deleteImage(imageUrlToRemove); // Your deleteImage utility
            setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
            toast.info("Gambar berhasil dihapus.");
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Gagal Menghapus Gambar", {
                description: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.",
            });
        }
    };

    // --- Category Fetching (React Query) ---
    const { data: categoriesData, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery<Category[], Error>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Gagal memuat kategori.");
            }
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // Cache categories for 5 minutes
    });

    const availableCategories = categoriesData || [];
    const categoryOptions = availableCategories.map(cat => ({
        value: cat.id,
        label: cat.name,
    }));

    // --- Map Coordinates Handler ---
    const handleLocationChange = (lat: number, lng: number) => {
        setCoordinates({ lat, lng });
    };


    // --- Event Creation Mutation (React Query) ---
    const createEventMutation = useMutation({
        mutationFn: async (newEventData: {
            name: string;
            description: string;
            startDate: Date;
            endDate: Date;
            latitude: number;
            longitude: number;
            anonymousName: string;
            price: string; // Still string to match form, API will parse/validate
            isPaid: boolean;
            organizerName?: string; // Optional
            imageUrls: string[];
            categoryIds: string[];
            tags: string[]; // Added tags
        }) => {
            const response = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newEventData,
                    startDate: newEventData.startDate.toISOString(), // Convert Date objects to ISO strings
                    endDate: newEventData.endDate.toISOString(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal membuat event.");
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success("Event Berhasil Dibuat!", {
                description: "Event Anda telah dikirim dan menunggu persetujuan admin.",
            });
            queryClient.invalidateQueries({ queryKey: ["events"] });
            // Redirect to home or event list
            router.replace("/");
        },
        onError: (error) => {
            toast.error("Gagal Membuat Event", {
                description: error.message || "Terjadi kesalahan saat membuat event.",
            });
        },
    });

    // --- Date & Time Validation ---
    const validateDateTime = () => {
        if (!startDate || !endDate || !startTime || !endTime) return false;

        const startDateTime = combineDateAndTime(startDate, startTime);
        const endDateTime = combineDateAndTime(endDate, endTime);

        return endDateTime > startDateTime;
    };

    // --- Final Submit Handler ---
    const handleSubmitEvent = () => {
        // Re-validate all steps just in case, before final submission
        // Step 1 Validation
        if (!title || !description || !selectedCategoryIds.length || !uploadedImageUrls.length) {
            toast.error("Form Belum Lengkap", { description: "Mohon lengkapi informasi dasar dan gambar." });
            return;
        }
        // Step 2 Validation
        if (!startDate || !endDate || !startTime || !endTime || !locationName || !address || !coordinates) {
            toast.error("Form Belum Lengkap", { description: "Mohon lengkapi informasi waktu dan lokasi." });
            return;
        }
        if (!validateDateTime()) {
            toast.error("Kesalahan Waktu", { description: "Tanggal dan waktu selesai harus setelah tanggal dan waktu mulai." });
            return;
        }
        // Step 3 Validation
        if (isPaid && (!price || parseFloat(price) <= 0)) {
            toast.error("Form Belum Lengkap", { description: "Mohon masukkan harga yang valid untuk event berbayar." });
            return;
        }
        if (!anonymousName.trim()) {
            toast.error("Form Belum Lengkap", { description: "Mohon masukkan Nama Anonim/Penyelenggara." });
            return;
        }

        // Prepare data for API
        const finalEventData = {
            name: title,
            description: description,
            startDate: combineDateAndTime(startDate, startTime),
            endDate: combineDateAndTime(endDate, endTime),
            address: address,
            location: locationName, // Mapped to 'location' in schema
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            price: isPaid ? price : "Free", // Send "Free" if not paid
            isPaid: isPaid,
            tags: tags,
            anonymousName: anonymousName,
            organizerName: organizerName || undefined, // Send undefined if empty to avoid empty string for optional field
            imageUrls: uploadedImageUrls,
            categoryIds: selectedCategoryIds,
        };

        // Trigger mutation
        createEventMutation.mutate(finalEventData);
    };


    return (
        <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto p-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fadeIn">Buat Event Baru</h1>
                    <p className="text-lg text-gray-600 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                        Bagikan pengalaman menarik dengan komunitas
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {[1, 2, 3, 4].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center">
                                <div
                                    className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                  ${step >= stepNumber ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"}
                `}
                                >
                                    {stepNumber}
                                </div>
                                {stepNumber < 4 && (
                                    <div
                                        className={`
                    h-1 w-24 mx-2 transition-all duration-300
                    ${step > stepNumber ? "bg-orange-500" : "bg-gray-200"}
                  `}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Langkah {step} dari {totalSteps}
                        </p>
                    </div>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                        <CardTitle className="text-2xl text-gray-900">
                            {step === 1 && "Informasi Dasar Event"}
                            {step === 2 && "Waktu & Lokasi Event"}
                            {step === 3 && "Detail Tambahan Event"}
                            {step === 4 && "Review & Publikasi Event"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-6 animate-slideIn">
                                <div>
                                    <Label htmlFor="title" className="text-lg font-semibold text-gray-900">
                                        Judul Event <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Masukkan judul event yang menarik..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="mt-2 h-12 text-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-lg font-semibold text-gray-900">
                                        Deskripsi Event <span className="text-red-500">*</span>
                                    </Label>
                                    <Editor placeholder="Ceritakan tentang event Anda secara detail..." content={description} onChange={setDescription} />
                                </div>

                                <div>
                                    {/* Categories Multi-Select */}
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-lg font-semibold text-gray-900">
                                            Kategori Event <span className="text-red-500">*</span>
                                        </Label>
                                        <MultiSelect
                                            options={categoryOptions}
                                            selected={selectedCategoryIds}
                                            onChange={setSelectedCategoryIds}
                                            placeholder={isLoadingCategories ? "Memuat kategori..." : (availableCategories.length === 0 ? "Tidak ada kategori tersedia" : "Pilih Kategori")}
                                            disabled={isLoadingCategories || availableCategories.length === 0}
                                        />
                                        {isErrorCategories && <p className="text-red-500 text-sm mt-1">Gagal memuat kategori.</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-lg font-semibold text-gray-900">Upload Gambar Event <span className="text-red-500">*</span></Label>
                                    <div className="mt-4">
                                        {/* Replaced with the improved image uploader design */}
                                        {uploadedImageUrls.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4 mb-4">
                                                {uploadedImageUrls.map((imageUrl, index) => (
                                                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-orange-200">
                                                        <Image
                                                            src={imageUrl || "/placeholder.svg"}
                                                            alt={`Uploaded image ${index + 1}`}
                                                            fill
                                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                            style={{ objectFit: 'cover' }}
                                                            className="transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {uploadedImageUrls.length < MAX_IMAGES && (
                                            <label
                                                htmlFor="image-upload-input"
                                                className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
                        ${isUploading ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-500'}
                      `}
                                            >
                                                {isUploading ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg text-orange-500 animate-pulse">Uploading...</span>
                                                        <p className="text-sm text-gray-500 mt-2">Mohon tunggu</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-gray-600 font-medium">
                                                            Klik untuk <span className="text-orange-600">upload gambar</span> atau <span className="text-orange-600">drag & drop</span>
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            PNG, JPG, JPEG, WEBP hingga 10MB. Maks {MAX_IMAGES} gambar.
                                                        </p>
                                                    </>
                                                )}
                                                <input
                                                    id="image-upload-input"
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/webp"
                                                    onChange={(e) => handleImageUpload(e.target.files)} // Pass FileList directly
                                                    className="sr-only"
                                                    multiple
                                                />
                                            </label>
                                        )}
                                        {uploadedImageUrls.length >= MAX_IMAGES && (
                                            <p className="text-sm text-center text-gray-500 mt-4">
                                                Anda telah mengunggah jumlah gambar maksimum ({MAX_IMAGES}).
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Time & Location */}
                        {step === 2 && (
                            <div className="space-y-6 animate-slideIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Start Date & Time */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold text-gray-900">
                                            Tanggal & Waktu Mulai <span className="text-red-500">*</span>
                                        </Label>
                                        {/* Start Date */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">Tanggal Mulai</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left pl-12 h-12 font-normal border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                                    >
                                                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <span className="text-sm lg:text-base">
                                                            {startDate ? format(startDate, "EEEE dd, MMMM yyyy", { locale: id }) : "Pilih Tanggal Mulai"}
                                                        </span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={setStartDate}
                                                        initialFocus
                                                        disabled={(date) => date < new Date()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Start Time */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">Waktu Mulai</Label>
                                            <Select value={startTime} onValueChange={setStartTime}>
                                                <SelectTrigger className="mt-2 h-12 text-lg py-5 border-gray-200 focus:border-orange-500 focus:ring-orange-500 ">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    <SelectValue placeholder="Pilih waktu mulai" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {timeOptions.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time} WIB
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* End Date & Time */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold text-gray-900">
                                            Tanggal & Waktu Selesai <span className="text-red-500">*</span>
                                        </Label>
                                        {/* End Date */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">Tanggal Selesai</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left pl-12 h-12 font-normal border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                                    >
                                                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <span className="text-sm lg:text-base">
                                                            {endDate ? format(endDate, "EEEE dd, MMMM yyyy", { locale: id }) : "Pilih Tanggal Selesai"}
                                                        </span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={setEndDate}
                                                        initialFocus
                                                        disabled={(date) => date < (startDate || new Date())} // End date cannot be before start date
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* End Time */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">Waktu Selesai</Label>
                                            <Select value={endTime} onValueChange={setEndTime}>
                                                <SelectTrigger className="mt-2 h-12 text-lg py-5 border-gray-200 focus:border-orange-500 focus:ring-orange-500 ">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    <SelectValue placeholder="Pilih waktu selesai" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {timeOptions.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time} WIB
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Duration Display */}
                                {startDate && endDate && startTime && endTime && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-sm text-orange-700">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-medium">Durasi Event:</span>
                                            <span>
                                                {(() => {
                                                    const start = combineDateAndTime(startDate, startTime);
                                                    const end = combineDateAndTime(endDate, endTime);
                                                    const diffMs = end.getTime() - start.getTime();

                                                    if (diffMs < 0) return "Waktu selesai harus setelah waktu mulai"; // Handle invalid duration

                                                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                                    const diffDays = Math.floor(diffHours / 24);

                                                    if (diffDays > 0) {
                                                        return `${diffDays} hari ${diffHours % 24} jam ${diffMinutes} menit`;
                                                    } else if (diffHours > 0) {
                                                        return `${diffHours} jam ${diffMinutes} menit`;
                                                    } else {
                                                        return `${diffMinutes} menit`;
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="location" className="text-lg font-semibold text-gray-900">
                                        Nama Lokasi <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative mt-2">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="location"
                                            placeholder="Contoh: Jakarta Convention Center"
                                            value={locationName} // Use locationName state
                                            onChange={(e) => setLocationName(e.target.value)}
                                            className="pl-12 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address" className="text-lg font-semibold text-gray-900">
                                        Alamat Lengkap <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Masukkan alamat lengkap lokasi event..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="mt-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="geolocation" className="text-lg mb-2 font-semibold text-gray-900">
                                        Titik Lokasi (Pada Peta) <span className="text-red-500">*</span>
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Pilih titik lokasi persis event Anda pada peta. Ini akan membantu peserta menemukan lokasi dengan mudah.
                                    </p>
                                    <GeolocationMap initialLat={coordinates?.lat} initialLng={coordinates?.lng} onChange={handleLocationChange} height="400px" />
                                    {coordinates && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Koordinat: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Event Details */}
                        {step === 3 && (
                            <div className="space-y-6 animate-slideIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                    <div>
                                        <Label className="text-lg font-semibold text-gray-900">Harga Tiket <span className="text-red-500">*</span></Label>
                                        <div className="mt-2 space-y-3">
                                            <div className="flex items-center space-x-4">
                                                <Button
                                                    type="button"
                                                    variant={!isPaid ? "default" : "outline"}
                                                    onClick={() => setIsPaid(false)}
                                                    className={`
                          ${!isPaid
                                                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                                                            : "border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                                        }
                        `}
                                                >
                                                    Gratis
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={isPaid ? "default" : "outline"}
                                                    onClick={() => setIsPaid(true)}
                                                    className={`
                          ${isPaid
                                                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                                                            : "border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                                        }
                        `}
                                                >
                                                    Berbayar
                                                </Button>
                                            </div>
                                            {isPaid && (
                                                <div className="relative animate-fadeIn">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold" >
                                                        RP
                                                    </span>
                                                    <Input
                                                        placeholder="Contoh: 50000"
                                                        value={price}
                                                        onChange={(e) => setPrice(e.target.value)}
                                                        className="pl-12 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                                        type="number" // Use type number for price input
                                                        min="0"
                                                        step="any"
                                                        required={isPaid} // Make it required only if paid
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="anonymousName" className="text-lg font-semibold text-gray-900">
                                        Nama Anonim/Penyelenggara <span className="text-red-500">*</span>
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-2">Nama ini akan ditampilkan sebagai penyelenggara event jika Anda tidak ingin menggunakan nama akun Anda.</p>
                                    <Input
                                        id="anonymousName"
                                        placeholder="Masukkan nama penyelenggara atau nama anonim..."
                                        value={anonymousName}
                                        onChange={(e) => setAnonymousName(e.target.value)}
                                        className="mt-2 h-12 text-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="organizerName" className="text-lg font-semibold text-gray-900">
                                        Nama Organizer (Opsional)
                                    </Label>
                                    <p className="text-sm text-gray-500 mb-2">Nama resmi organisasi atau individu jika berbeda dari nama anonim/akun.</p>
                                    <Input
                                        id="organizerName"
                                        placeholder="Contoh: PT. Event Kreatif"
                                        value={organizerName}
                                        onChange={(e) => setOrganizerName(e.target.value)}
                                        className="mt-2 h-12 text-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <Label className="text-lg font-semibold text-gray-900">Tags Event (Opsional)</Label>
                                    <p className="text-sm text-gray-500 mb-2">Tambahkan kata kunci yang relevan dengan event Anda.</p>
                                    <div className="mt-2 space-y-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Tambahkan tag (misal: 'konser', 'gratis', 'online')"
                                                    value={currentTag}
                                                    onChange={(e) => setCurrentTag(e.target.value)}
                                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                                    className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                                />
                                            </div>
                                            <Button type="button" onClick={addTag} className="bg-orange-500 hover:bg-orange-600 text-white">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        className="bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer flex items-center gap-1"
                                                        onClick={() => removeTag(tag)}
                                                    >
                                                        {tag}
                                                        <X className="h-3 w-3" />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review & Publish */}
                        {step === 4 && (
                            <div className="space-y-6 animate-slideIn">
                                <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Eye className="h-5 w-5 mr-2 text-orange-600" />
                                        Review Event Anda
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-xl">{title || "Judul Event (Belum Diisi)"}</h4>
                                            <div className="text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: description || "Deskripsi event akan muncul di sini (Belum Diisi)..." }}></div>
                                        </div>

                                        {uploadedImageUrls.length > 0 && (
                                            <div className="mt-4">
                                                <p className="font-semibold text-gray-900 mb-2">Gambar Event:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {uploadedImageUrls.map((url, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={url}
                                                            alt={`Preview ${idx + 1}`}
                                                            width={100}
                                                            height={100}
                                                            className="w-full h-24 object-cover rounded-md"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-2">
                                                <div className="flex items-center text-gray-600">
                                                    <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                                    <span className="max-w-[200px]">{locationName || "Lokasi belum diisi"}, {address || "Alamat belum diisi"}</span>
                                                </div>

                                                <div className="flex items-center text-gray-600">
                                                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                                    <span>
                                                        {startDate && format(startDate, "dd MMM yyyy", { locale: id })} {startTime} -
                                                        {endDate && format(endDate, "dd MMM yyyy", { locale: id })} {endTime}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center text-gray-600">
                                                    <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                                                    <span>{isPaid ? `Rp ${price || "0"}` : "Gratis"}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Tag className="h-4 w-4 mr-2 text-orange-500" />
                                                    <span>{selectedCategoryIds.length > 0 ? selectedCategoryIds.map(id => categoryOptions.find(opt => opt.value === id)?.label).join(', ') : "Belum ada kategori"}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Users className="h-4 w-4 mr-2 text-orange-500" /> {/* Reusing Users icon for organizer */}
                                                    <span>Penyelenggara: {organizerName || anonymousName || "Anonim"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {tags.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="border-orange-200 text-orange-700">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                                    <h4 className="font-semibold text-yellow-800 mb-2">Penting Sebelum Publikasi:</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                                        <li>Pastikan semua informasi sudah **benar dan akurat**.</li>
                                        <li>Event yang sudah dipublikasi dapat **diedit terbatas**.</li>
                                        <li>Peserta akan mendapat **notifikasi** jika ada perubahan penting.</li>
                                        <li>Event akan **menunggu persetujuan admin** sebelum ditampilkan secara publik.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 1 || createEventMutation.isPending}
                                className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent disabled:opacity-50"
                            >
                                Sebelumnya
                            </Button>

                            <div className="flex gap-3">
                                {step < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={createEventMutation.isPending || isUploading}
                                        className="bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        Selanjutnya
                                    </Button>
                                ) : (
                                    <>
                                        {/* <Button
                    type="button"
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent"
                    disabled={createEventMutation.isPending || isUploading}
                  >
                    Simpan Draft
                  </Button> */}
                                        <Button
                                            type="button"
                                            onClick={handleSubmitEvent} // Final submission button
                                            disabled={createEventMutation.isPending || isUploading}
                                            className="bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all disabled:opacity-50"
                                        >
                                            {createEventMutation.isPending ? "Memublikasikan..." : "Publikasikan Event"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}