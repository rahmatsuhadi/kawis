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
import { CalendarIcon, Upload, X } from "lucide-react";
import { toast } from "sonner"; // Import toast for notifications
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation & useQueryClient
import { deleteImage, uploadImage } from "@/lib/image-service";
import GeolocationMap from "../interaktif-maps/LocationMapInput";


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
  const [isUploading, setIsUploading] = useState(false); // State untuk menunjukkan proses upload gambar

  // Inisialisasi QueryClient untuk invalidasi cache
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Reset form
      setEventName("");
      setDescription("");
      setAddress("");
      setStartDate(undefined);
      setEndDate(undefined);
      // setGoogleMapsLink("");
      setCoordinates(null)
      setUploadedImageUrls([]);
      setAnonymousName("");
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

    if (startDate >= endDate) {
      toast.error("Kesalahan Tanggal", {
        description: "Tanggal selesai harus setelah tanggal mulai.",
      });
      return;
    }


    const eventData = {
      name: eventName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      latitude: coordinates.lat,
      address: address,
      longitude: coordinates.lng,
      anonymousName: anonymousName,
      imageUrls: uploadedImageUrls,
    };

    createEventMutation.mutate(eventData);
  };

  const isFormDisabled = createEventMutation.isPending || isUploading;

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
            <Textarea
              id="description"
              placeholder="Masukan Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="min-h-20 lg:min-h-24 border-orange-200 focus:border-orange-500"
              disabled={isFormDisabled}
            />
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

          {/* Date Pickers - Stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm lg:text-base font-medium">Tanggal Mulai <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-orange-200 hover:border-orange-500"
                    disabled={isFormDisabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm lg:text-base">
                      {startDate
                        ? format(startDate, "EEEE dd, MMMM yyyy", { locale: id })
                        : "Pilih Tanggal Mulai"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-sm lg:text-base font-medium">Tanggal Selesai <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-orange-200 hover:border-orange-500"
                    disabled={isFormDisabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm lg:text-base">
                      {endDate
                        ? format(endDate, "EEEE dd, MMMM yyyy", { locale: id })
                        : "Pilih Tanggal Selesai"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus fromDate={startDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

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

          {/* Create Event Button */}
          <div className="pt-4 lg:pt-6">
            <Button
              onClick={handleSubmitEvent}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 lg:py-3 text-base lg:text-lg"
              disabled={isFormDisabled}
            >
              {createEventMutation.isPending ? "Membuat Event..." : "Create Event Now"}
            </Button>
            <Button
              variant="link"
              className="w-full justify-center text-orange-500 hover:text-orange-600 hover:bg-orange-50 text-sm lg:text-base"
              disabled={isFormDisabled}
            >
              Or create a post about existing event
            </Button>
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
    </div>
  );
}