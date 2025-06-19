"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { LocationEditModal } from "@/components/location/LocationEditModal"; // Import modal Anda
import { Button } from "../ui/button";

// Definisikan tipe props
interface LocationDisplayAndTriggerProps {
  initialAddress: string;
  initialRadius: string;
  // Anda mungkin juga ingin menerima initial latitude dan longitude
  initialLatitude: number;
  initialLongitude: number;
  // Callback saat lokasi diubah (misalnya untuk menyimpannya ke state di parent)
  onLocationChange: (address: string, lat: number, lng: number, radius: string) => void;
}

export function LocationDisplayAndTrigger({
  initialAddress,
  initialRadius,
  initialLatitude,
  initialLongitude,
  onLocationChange,
}: LocationDisplayAndTriggerProps) {
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [currentRadius, setCurrentRadius] = useState(initialRadius);
  const [currentLatitude, setCurrentLatitude] = useState(initialLatitude);
  const [currentLongitude, setCurrentLongitude] = useState(initialLongitude);

  // Sinkronkan state lokal jika props berubah (misalnya, setelah refresh data user)
  useEffect(() => {
    setCurrentAddress(initialAddress);
    setCurrentRadius(initialRadius);
    setCurrentLatitude(initialLatitude);
    setCurrentLongitude(initialLongitude);
  }, [initialAddress, initialRadius, initialLatitude, initialLongitude]);


  const handleSaveLocation = (newAddress: string, newLat: number, newLng: number, newRadius: string) => {
    setCurrentAddress(newAddress);
    setCurrentRadius(newRadius);
    setCurrentLatitude(newLat);
    setCurrentLongitude(newLng);
    onLocationChange(newAddress, newLat, newLng, newRadius); // Panggil callback ke parent
  };

  return (
    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
      <div className="relative w-full">
        <div className="pl-4 pr-20 py-2 rounded-sm bg-orange-50 border-orange-200 cursor-pointer">
          <h4 className="text-sm lg:text-base text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">
            {currentAddress || "Lokasi tidak tersedia"}
          </h4>
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs lg:text-sm">
            {currentRadius} KM
          </Badge>
          <LocationEditModal // Ini adalah modal yang akan dipicu oleh DialogTrigger di dalamnya
            currentAddress={currentAddress}
            currentRadius={currentRadius}
            onSave={handleSaveLocation}
          >
             {/* Child dari DialogTrigger di LocationEditModal */}
             <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500 hover:bg-orange-50">
                <MapPin className="w-4 h-4" />
             </Button>
          </LocationEditModal>
        </div>
      </div>
    </div>
  );
}