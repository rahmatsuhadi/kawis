"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale for Indonesian
import { CalendarIcon, Clock, Upload, X } from "lucide-react";
import { toast } from "sonner"; // Import toast for notifications
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Import useMutation & useQueryClient
import { deleteImage, uploadImage } from "@/lib/image-service";
import GeolocationMap from "../interaktif-maps/LocationMapInput";
import { Category } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MultiSelect } from "../ui/multi-select";
import Editor from "../ui/rich-text/Editor";
import { useRouter } from "next/navigation";


export default function FormCreateEvent() {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  // const [coordinates, setCoordinates] = useState})
  // const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // Menyimpan URL gambar yang sudah diupload
  const [anonymousName, setAnonymousName] = useState(""); // Tambahkan state untuk nama anonim
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false); // State untuk menunjukkan proses upload gambar

  // ✨ NEW: Time states
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")

  // Inisialisasi QueryClient untuk invalidasi cache
  const queryClient = useQueryClient();

  // ✨ NEW: Generate time options
  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        times.push(timeString)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  // --- useQuery untuk Mengambil Daftar Kategori ---
  const { data: categoriesData, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memuat kategori.");
      }
      return res.json(); // API categories harus mengembalikan array langsung, atau sesuaikan
    },
    staleTime: 1000 * 60 * 5, // Cache kategori selama 5 menit
  });
  const availableCategories = categoriesData || [];

  // Konversi format kategori untuk komponen MultiSelect
  const categoryOptions = availableCategories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  const router = useRouter()
  // useMutation untuk mengirim data event ke API
  const createEventMutation = useMutation({
    mutationFn: async (newEventData: {
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      latitude: number;
      longitude: number;
      anonymousName: string;
      imageUrls: string[];
      categoryIds: string[];
    }) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEventData),
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
      queryClient.invalidateQueries({ queryKey: ["events", "events-nearby"] });
      // Reset form
      setEventName("");
      setDescription("");
      setAddress("");
      setStartDate(undefined);
      setEndDate(undefined);
      setStartTime("09:00")
      setEndTime("17:00")
      // setGoogleMapsLink("");
      setCoordinates(null)
      setUploadedImageUrls([]);
      setAnonymousName("");
      setSelectedCategoryIds([]);
      router.replace("/main")
    },
    onError: (error) => {
      toast.error("Gagal Membuat Event", {
        description: error.message || "Terjadi kesalahan saat membuat event.",
      });
    },
  });


  // --- Fungsi untuk Upload Gambar ke Supabase (menggunakan Service Utility) ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImageUrls.length + files.length > 5) {
      toast.error("Batas Gambar Tercapai", {
        description: "Maksimal 5 gambar yang bisa diupload.",
      });
      return;
    }

    setIsUploading(true);
    const uploadToastId = toast.loading("Mengunggah gambar...");
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadImage(file); // Panggil fungsi upload dari service utility
        newUploadedUrls.push(imageUrl);
      }

      setUploadedImageUrls((prevUrls) => [...prevUrls, ...newUploadedUrls]);
      toast.dismiss(uploadToastId);
      toast.success(`${newUploadedUrls.length} gambar berhasil diunggah!`);

    } catch (error) {
      setIsUploading(false)
      toast.dismiss(uploadToastId);

      if (error instanceof Error) {
        // Jika error adalah instance dari Error, ambil message-nya
        toast.error("Gagal Mengunggah Gambar", {
          description: error.message || "Terjadi kesalahan tidak diketahui saat mengunggah gambar",
        });
      } else {
        toast.error("Gagal Mengunggah Gambar", {
          description: "Terjadi kesalahan yang tidak diketahui.",
        });
      }
      console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrlToRemove = uploadedImageUrls[index];

    try {
      // Panggil fungsi delete dari service utility
      await deleteImage(imageUrlToRemove);
      setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index));
      toast.info("Gambar berhasil dihapus.");
    } catch (error) {
      let description = "Terjadi kesalahan saat menghapus gambar.";
      if (error instanceof Error) {
        // Jika error adalah instance dari Error, ambil message-nya
        description = error.message;
      } else {
        // Jika error bukan instance dari Error (misalnya objek lain)
        description = "Terjadi kesalahan yang tidak diketahui.";

      }

      toast.error("Gagal Menghapus Gambar", {
        description: description,
      });
      console.error("Delete Error:", error);
    }
  };


  const handleLocationChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng })
  }


  // ✨ NEW: Combine date and time function
  const combineDateAndTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(":").map(Number)
    const combined = new Date(date)
    combined.setHours(hours, minutes, 0, 0)
    return combined
  }

  // ✨ NEW: Enhanced form validation with time
  const validateDateTime = () => {
    if (!startDate || !endDate) return false

    const startDateTime = combineDateAndTime(startDate, startTime)
    const endDateTime = combineDateAndTime(endDate, endTime)

    return endDateTime > startDateTime
  }


  // --- Fungsi untuk Handle Submit Form Event ---
  const handleSubmitEvent = async () => {
    // Validasi form dasar
    if (!eventName || !description || !address || !startDate || !endDate || !address || uploadedImageUrls.length === 0) {
      toast.error("Form Tidak Lengkap", {
        description: "Mohon isi semua kolom yang wajib dan unggah setidaknya satu gambar.",
      });
      return;
    }

    if (!coordinates) {
      toast.error("Form Tidak Lengkap", {
        description: "Mohon setel maps ke lokasi terkait.",
      });
      return;
    }


    // ✨ NEW: Enhanced date-time validation
    if (!validateDateTime()) {
      toast.error("Kesalahan Waktu", {
        description: "Tanggal dan waktu selesai harus setelah tanggal dan waktu mulai.",
      })
      return
    }

    // ✨ NEW: Combine date and time for API
    const startDateTime = combineDateAndTime(startDate, startTime)
    const endDateTime = combineDateAndTime(endDate, endTime)
    
    const eventData = {
      name: eventName,
      description: description,
      startDate: startDateTime, // Combined date + time
      endDate: endDateTime, // Combined date + time
      latitude: coordinates.lat,
      address: address,
      longitude: coordinates.lng,
      anonymousName: anonymousName,
      imageUrls: uploadedImageUrls,
      categoryIds: selectedCategoryIds,
    };

    createEventMutation.mutate(eventData);
  };

  const isFormDisabled = createEventMutation.isPending || isUploading || isLoadingCategories;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Event Form */}
      <div className="lg:col-span-2">
        {/* Card component removed to simplify the example, if you need it, add it back */}
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-sm lg:text-base font-medium">
              Nama Event <span className="text-red-500">*</span>
            </Label>
            <button onClick={() =>setDescription("")} type="button">sadasd</button>
            <Input
              id="eventName"
              placeholder="Nama Event"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="border-orange-200 focus:border-orange-500"
              disabled={isFormDisabled}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm lg:text-base font-medium">
              Description <span className="text-red-500">*</span>
            </Label>

            <Editor placeholder="Masukan Description" disabled={isFormDisabled} content={description} onChange={(e) => setDescription(e)} />
            {/* <Textarea
              id="description"
              placeholder="Masukan Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="min-h-20 lg:min-h-24 border-orange-200 focus:border-orange-500"
              disabled={isFormDisabled}
            /> */}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm lg:text-base font-medium">
              Alamat <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              placeholder="Masukan Alamat"
              value={address}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
              className="min-h-16 lg:min-h-20 border-orange-200 focus:border-orange-500"
              disabled={isFormDisabled}
            />
          </div>

          {/* Anonymous Name */}
          <div className="space-y-2">
            <Label htmlFor="anonymousName" className="text-sm lg:text-base font-medium">
              {`Nama Pembuat Event (Opsional, gunakan "Anonim" jika kosong)`}
            </Label>
            <Input
              id="anonymousName"
              placeholder="Nama Anda atau Anonim"
              value={anonymousName}
              onChange={(e) => setAnonymousName(e.target.value)}
              className="border-orange-200 focus:border-orange-500"
              disabled={isFormDisabled}
            />
          </div>


          {/* Categories Multi-Select */}
          <div className="space-y-2">
            <Label className="text-sm lg:text-base font-medium">Kategori Event <span className="text-red-500">*</span></Label>
            <MultiSelect
              options={categoryOptions}
              selected={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
              placeholder={isLoadingCategories ? "Memuat kategori..." : (availableCategories.length === 0 ? "Tidak ada kategori tersedia" : "Pilih Kategori")}
              disabled={isFormDisabled || isLoadingCategories || availableCategories.length === 0}
            />
            {isErrorCategories && <p className="text-red-500 text-xs mt-1">Gagal memuat kategori.</p>}
          </div>

          {/* ✨ NEW: Enhanced Date & Time Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date & Time */}
            <div className="space-y-4">
              <Label className="text-sm lg:text-base font-medium">
                Tanggal & Waktu Mulai <span className="text-red-500">*</span>
              </Label>

              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Tanggal Mulai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-orange-200 hover:border-orange-500"
                      disabled={isFormDisabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                <Label className="text-xs text-gray-600">Waktu Mulai</Label>
                <Select value={startTime} onValueChange={setStartTime} disabled={isFormDisabled}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-500">
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
              <Label className="text-sm lg:text-base font-medium">
                Tanggal & Waktu Selesai <span className="text-red-500">*</span>
              </Label>

              {/* End Date */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Tanggal Selesai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-orange-200 hover:border-orange-500"
                      disabled={isFormDisabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                      disabled={(date) => date < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Waktu Selesai</Label>
                <Select value={endTime} onValueChange={setEndTime} disabled={isFormDisabled}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-500">
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

          {/* ✨ NEW: Time Duration Display */}
          {startDate && endDate && startTime && endTime && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-orange-700">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Durasi Event:</span>
                <span>
                  {(() => {
                    const start = combineDateAndTime(startDate, startTime)
                    const end = combineDateAndTime(endDate, endTime)
                    const diffMs = end.getTime() - start.getTime()
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                    const diffDays = Math.floor(diffHours / 24)

                    if (diffDays > 0) {
                      return `${diffDays} hari ${diffHours % 24} jam ${diffMinutes} menit`
                    } else {
                      return `${diffHours} jam ${diffMinutes} menit`
                    }
                  })()}
                </span>
              </div>
            </div>
          )}

          {/* Media Upload (di frontend) */}
          <div className="space-y-4">
            <Label className="text-sm lg:text-base font-medium">Media (Maks 5 Gambar) <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {uploadedImageUrls.map((imageUrl, index) => ( // Render URL gambar yang sudah diupload
                <div key={index} className="relative group">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Uploaded image ${index + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-20 lg:h-24 object-cover rounded-lg border-2 border-orange-200"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-5 lg:w-6 h-5 lg:h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                    disabled={isFormDisabled}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {/* Upload Button */}
              {uploadedImageUrls.length < 5 && (
                <label className="cursor-pointer">
                  <div className="w-full h-20 lg:h-24 border-2 border-dashed border-orange-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 transition-colors">
                    {isUploading ? (
                      <span className="text-sm text-orange-500">Uploading...</span>
                    ) : (
                      <>
                        <Upload className="w-4 lg:w-6 h-4 lg:h-6 text-orange-500 mb-1" />
                        <span className="text-xs text-orange-600">Upload</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload} // Memanggil fungsi upload ke Supabase
                    className="hidden"
                    multiple
                    disabled={isFormDisabled || uploadedImageUrls.length >= 5}
                  />
                </label>
              )}
            </div>
            <p className="text-xs lg:text-sm text-gray-500">* Maksimal 5 gambar.</p>
          </div>


        </div>
      </div>

      {/* Location Sidebar */}
      <div className="lg:col-span-1">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div>
            <h3 className="text-base lg:text-lg font-semibold mb-4">Lokasi</h3>
            <div className="">
              <GeolocationMap onChange={handleLocationChange} height="400px" />
              {/* <LocationMap address={address} /> */}
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="googleMapsLink" className="text-sm lg:text-base font-medium">
              Link Google Maps (Opsional)
            </Label>
            <Input
              id="googleMapsLink"
              placeholder="Paste Here"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              className="border-orange-200 focus:border-orange-500"
              disabled={isFormDisabled}
            />
          </div> */}


        </div>
      </div>

      <div className="lg:col-span-2 md:mb-2 mb-10">
        {/* Create Event Button */}
        <div className="pt-4 lg:pt-6">
          <Button
            onClick={handleSubmitEvent}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 lg:py-3 text-base lg:text-lg"
            disabled={isFormDisabled}
          >
            {createEventMutation.isPending ? "Membuat Event..." : "Buat Event"}
          </Button>

        </div>
      </div>

    </div>
  );
}