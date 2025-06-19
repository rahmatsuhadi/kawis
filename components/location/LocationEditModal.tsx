"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Untuk notifikasi
import { Input } from "../ui/input";

// Tipe props untuk modal
interface LocationEditModalProps {
  currentAddress: string;
  currentRadius: string; // Misal "5" untuk 5 KM
  onSave: (newAddress: string, newLat: number, newLng: number, newRadius: string) => void;
  // onGetCurrentLocation: () => void; // Fungsi untuk mendapatkan lokasi saat ini dari parent
}

export function LocationEditModal({ currentAddress, currentRadius, onSave }: LocationEditModalProps) {
  const [address, setAddress] = useState(currentAddress);
  const [radius, setRadius] = useState(currentRadius);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State untuk mengontrol buka/tutup modal

  // Sinkronkan state lokal dengan props saat modal dibuka atau props berubah
  useEffect(() => {
    setAddress(currentAddress);
    setRadius(currentRadius);
    // Asumsi Anda juga memiliki currentLatitude dan currentLongitude di parent jika ingin initial value akurat
  }, [currentAddress, currentRadius]);

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    toast.info("Mencari lokasi Anda...", { id: "get-location-toast", duration: 5000 });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          // Anda perlu layanan geocoding di sini untuk mengonversi lat/lng menjadi alamat yang bisa dibaca.
          // Untuk demo, kita akan tampilkan koordinat mentah.
          const newAddr = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
          setAddress(newAddr);
          toast.dismiss("get-location-toast");
          toast.success("Lokasi ditemukan!", { description: newAddr });
          setIsGettingLocation(false);
        },
        (error) => {
          toast.dismiss("get-location-toast");
          toast.error("Gagal mendapatkan lokasi.", {
            description: error.message || "Pastikan izin lokasi diaktifkan.",
          });
          console.error("Geolocation error:", error);
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Opsi Geolocation
      );
    } else {
      toast.dismiss("get-location-toast");
      toast.error("Geolocation tidak didukung browser Anda.");
      setIsGettingLocation(false);
    }
  };

  const handleSave = () => {
    if (!address || latitude === null || longitude === null || !radius) {
      toast.error("Lokasi tidak lengkap.", { description: "Harap dapatkan lokasi atau masukkan koordinat." });
      return;
    }
    onSave(address, latitude, longitude, radius);
    setIsOpen(false); // Tutup modal setelah disimpan
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Ini adalah tombol yang akan membuka modal.
            Anda bisa meletakkannya di komponen LocationDisplayAndTrigger */}
        {/* Contoh placeholder, akan diganti oleh parent */}
        <Button variant="outline" className="w-full">Edit Lokasi</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Lokasi & Radius</DialogTitle>
          <DialogDescription>
            Perbarui alamat pencarian dan radius event Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">Alamat Pencarian</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Amikom University, Yogyakarta"
              readOnly={isGettingLocation} // Readonly saat mendapatkan lokasi
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius">Radius Pencarian</Label>
            <Select value={radius} onValueChange={setRadius} disabled={isGettingLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 KM</SelectItem>
                <SelectItem value="5">5 KM</SelectItem>
                <SelectItem value="10">10 KM</SelectItem>
                <SelectItem value="20">20 KM</SelectItem>
                <SelectItem value="50">50 KM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Koordinat Saat Ini</Label>
            <div className="flex space-x-2">
              <Input value={latitude?.toFixed(4) || "N/A"} placeholder="Latitude" readOnly />
              <Input value={longitude?.toFixed(4) || "N/A"} placeholder="Longitude" readOnly />
            </div>
          </div>

          <Button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendapatkan Lokasi...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Perbarui Lokasi Saat Ini
              </>
            )}
          </Button>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isGettingLocation}>
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}