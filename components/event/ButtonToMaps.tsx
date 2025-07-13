"use client"
import { EventDetail } from "@/app/main/e/[id]/page";
import { Button } from "../ui/button";
import { MapPin } from "lucide-react";


const ButtonMaps = ({event}:{event:EventDetail}) => {
    return (
        <Button
            variant="outline"
            className="w-full mt-4 border-orange-500 text-orange-500 hover:bg-orange-50 text-sm lg:text-base"
            onClick={() => {
                if (event.latitude !== null && event.longitude !== null) {
                    // Buat link Google Maps untuk navigasi
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
                    // Jika ada lokasi pengguna, tambahkan sebagai origin
                    // if (userLocation?.latitude && userLocation?.longitude) { // Hanya jika Client Component
                    //   googleMapsUrl += `&origin=${userLocation.latitude},${userLocation.longitude}`;
                    // }
                    window.open(googleMapsUrl, '_blank'); // Buka di tab baru
                } else {
                    alert('Koordinat event tidak tersedia untuk melihat di peta.');
                }
            }}
        >
            <MapPin className="w-4 h-4 mr-2" />
            Lihat di Maps
        </Button>
    )
}

export default ButtonMaps;