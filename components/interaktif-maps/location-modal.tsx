"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Map, { Marker } from "react-map-gl/mapbox"
import { MapPin, Navigation, Save, X } from 'lucide-react'
import { useGeolocation } from "@/context/geolocation-context"
import "mapbox-gl/dist/mapbox-gl.css"
import { toast } from "sonner"
import { Textarea } from "../ui/textarea"

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { location, updateLocation , address } = useGeolocation()

  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(
    location ? { lat: location.latitude, lng: location.longitude } : null
  )
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = React.useRef<any>(null)
    const [isRecentering, setIsRecentering] = useState(false)
    console.log(isRecentering)

  useEffect(() =>{
    if(location){
      setTempLocation({
      lat: location?.latitude || -6.2088,
      lng: location?.longitude || 106.84
    })
    recenterToUserLocation()
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  },[location, isOpen])


  const recenterToUserLocation = () => {
    if (tempLocation && mapRef.current) {
      setIsRecentering(true)

      mapRef.current.flyTo({
        center: [tempLocation.lng, tempLocation.lat],
        zoom: 13,
        duration: 1500,
        essential: true,
      })

      // Reset button state after animation
      setTimeout(() => {
        setIsRecentering(false)
      }, 1500)
    }
  }

  // Get current GPS location
  const getCurrentLocation = useCallback(() => {
    setIsLoading(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setTempLocation(newLocation)
          setTimeout(() =>{
            recenterToUserLocation()
            setIsLoading(false)
          },1000)
        },
        (error) => {
          // Default to Jakarta if geolocation fails
          console.log(error.message)
          const defaultLocation = { lat: -6.2088, lng: 106.8456 }
          toast.error("Gagal dalam mengambil lokasi saat ini. ")
          setTempLocation(defaultLocation)
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    } else {
      // Default to Jakarta if geolocation not supported
      const defaultLocation = { lat: -6.2088, lng: 106.8456 }
      toast.error("Lokasi anda tidak diaktifkan atau perangkat anda tidak support.")
      setTempLocation(defaultLocation)
      setIsLoading(false)
    }
  }, [])

  // Handle marker drag
  const handleMarkerDrag = useCallback((event: {lngLat: {lat: number, lng: number}}) => {
    const newLocation = {
      lat: event.lngLat.lat,
      lng: event.lngLat.lng,
    }
    setTempLocation(newLocation)
  }, [])

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback((event:  {lngLat: {lat: number, lng: number}}) => {
    setIsDragging(false)
    const newLocation = {
      lat: event.lngLat.lat,
      lng: event.lngLat.lng,
    }
    setTempLocation(newLocation)
  }, [])

  // Save location and close modal
  const handleSaveLocation = () => {
    if (tempLocation) {
      updateLocation({ latitude: tempLocation.lat, longitude: tempLocation.lng })
      onClose()
    }
  }

  // Reset to current location when modal opens
  const handleModalOpen = () => {
    if (location) {
      setTempLocation({ lat: location.latitude, lng: location.longitude })
    } else {
      getCurrentLocation()
    }
  }

  // Handle modal state change
  const handleOpenChange = (open: boolean) => {
    if (open) {
      handleModalOpen()
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            Pilih Lokasi Anda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={getCurrentLocation}
              disabled={isLoading}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isLoading ? "Mencari..." : "Gunakan GPS"}
            </Button>

            <Button
              onClick={handleSaveLocation}
              disabled={!tempLocation}
              size="sm"
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Lokasi
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
          </div>

          {/* Map Container */}
          <div className="w-full h-[400px] rounded-lg overflow-hidden border">
            {tempLocation && (
              <Map
               ref={mapRef}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                initialViewState={{
                  longitude: tempLocation.lng,
                  latitude: tempLocation.lat,
                  zoom: 15,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL}
                attributionControl={false}
                dragPan={!isDragging}
              >
                {/* Draggable Marker */}
                <Marker
                  longitude={tempLocation.lng}
                  latitude={tempLocation.lat}
                  anchor="bottom"
                  draggable
                  onDrag={handleMarkerDrag}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleMarkerDragEnd}
                >
                  <div className="relative">
                    {/* Marker Pin */}
                    <div
                      className={`w-10 h-10 bg-orange-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center cursor-move hover:bg-orange-600 transition-colors ${isDragging ? "scale-110" : ""}`}
                    >
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    {/* Marker Shadow */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-black opacity-20 rounded-full blur-sm"></div>
                  </div>
                </Marker>
              </Map>
            )}

            {!tempLocation && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{`Klik "Gunakan GPS" untuk menampilkan peta`}</p>
                </div>
              </div>
            )}
          </div>

          {/* Location Info */}
          {tempLocation && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={tempLocation.lat.toFixed(6)}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={tempLocation.lng.toFixed(6)}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Alamat Tersimpan</Label>
                  <Textarea
                    id="address"
                    value={address}
                    readOnly
                    className="bg-white"
                  ></Textarea>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>💡 <strong>Tips:</strong> {`Drag marker untuk mengubah lokasi, atau klik "Gunakan GPS" untuk lokasi otomatis`}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
