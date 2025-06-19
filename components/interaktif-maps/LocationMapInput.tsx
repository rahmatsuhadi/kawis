"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Map, { Marker } from "react-map-gl/mapbox"
import { Card, CardContent, } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"

interface GeolocationMapProps {
  onChange?: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
  height?: string
  width?: string
}

export default function GeolocationMap({
  onChange,
  initialLat,
  initialLng,
  height = "400px",
  width = "100%",
}: GeolocationMapProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [address, setAddress] = useState("")

  // Refs for debouncing - Fixed with proper initial values
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastOnChangeRef = useRef<{ lat: number; lng: number } | null>(null)

  // Debounced onChange to prevent infinite loops
  const debouncedOnChange = useCallback(
    (lat: number, lng: number) => {
      // Clear previous timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Check if coordinates actually changed
      if (
        lastOnChangeRef.current &&
        Math.abs(lastOnChangeRef.current.lat - lat) < 0.000001 &&
        Math.abs(lastOnChangeRef.current.lng - lng) < 0.000001
      ) {
        return // Skip if coordinates haven't changed significantly
      }

      // Set timeout for debouncing
      debounceRef.current = setTimeout(() => {
        lastOnChangeRef.current = { lat, lng }
        onChange?.(lat, lng)
      }, 100) // 100ms debounce
    },
    [onChange],
  )

  // Get current location on mount
  const getCurrentLocation = useCallback(() => {
    setIsLoading(true)

    if (initialLat && initialLng) {
      const initialLocation = { lat: initialLat, lng: initialLng }
      setLocation(initialLocation)
      // Don't call onChange for initial values to prevent loops
      setIsLoading(false)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(newLocation)
          debouncedOnChange(newLocation.lat, newLocation.lng)
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to Jakarta if geolocation fails
          const defaultLocation = { lat: -7.791863, lng: 110.368183 }
          setLocation(defaultLocation)
          debouncedOnChange(defaultLocation.lat, defaultLocation.lng)
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    } else {
      // Default to Jakarta if geolocation not supported
      const defaultLocation = { lat: -7.791863, lng: 110.368183 }
      setLocation(defaultLocation)
      debouncedOnChange(defaultLocation.lat, defaultLocation.lng)
      setIsLoading(false)
    }
  }, [initialLat, initialLng, debouncedOnChange])

  // Handle marker drag - only update local state during drag
  const handleMarkerDrag = useCallback((event: { lngLat: { lat: number; lng: number } }) => {
    const newLocation = {
      lat: event.lngLat.lat,
      lng: event.lngLat.lng,
    }
    setLocation(newLocation)
    if (onChange) {
      // Optional: hanya panggil onChange jika perlu
    }
    // Don't call onChange during drag to prevent performance issues
  }, [onChange])

  // Handle drag end - call onChange only when drag is complete
  // const handleMarkerDragEnd = useCallback(
  //   (event: any) => {
  //     const newLocation = {
  //       lat: event.lngLat.lat,
  //       lng: event.lngLat.lng,
  //     }
  //     setLocation(newLocation)
  //     setIsDragging(false)
  //     debouncedOnChange(newLocation.lat, newLocation.lng)
  //   },
  //   [debouncedOnChange],
  // )

  // Copy coordinates to clipboard
  // const copyCoordinates = async () => {
  //   if (!location) return

  //   const coordinates = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
  //   try {
  //     await navigator.clipboard.writeText(coordinates)
  //     setCopied(true)
  //     setTimeout(() => setCopied(false), 2000)
  //   } catch (err) {
  //     console.error("Failed to copy coordinates:", err)
  //   }
  // }

  // Reverse geocoding to get address (simplified)
  const getAddress = useCallback(async (lat: number, lng: number) => {
    try {
      // This is a simplified address format - in real app you'd use Mapbox Geocoding API
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } catch (error) {
      console.error("Error getting address:", error)
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  }, [])

  // Reset to current location
  // const resetToCurrentLocation = useCallback(() => {
  //   getCurrentLocation()
  // }, [getCurrentLocation])

  useEffect(() => {
    getCurrentLocation()
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove getCurrentLocation from dependencies to prevent loops

  useEffect(() => {
    if (location) {
      getAddress(location.lat, location.lng)
    }
  }, [location, getAddress])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 animate-spin" />
            <span>Mencari lokasi Anda...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Map Container */}
      {/* <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Pilih Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0"> */}
      <div style={{ height, width }} className="relative">
        {location && (
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            initialViewState={{
              longitude: location.lng,
              latitude: location.lat,
              zoom: 15,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL}
            attributionControl={false}
            dragPan={!isDragging}
          >
            {/* Draggable Marker */}
            <Marker
              longitude={location.lng}
              latitude={location.lat}
              anchor="bottom"
              draggable
              onDrag={handleMarkerDrag}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            >
              <div className="relative">
                {/* Marker Pin */}
                <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-move hover:bg-orange-600 transition-colors">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                {/* Marker Shadow */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
              </div>
            </Marker>
          </Map>
        )}

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={getCurrentLocation}
            size="sm"
            className="bg-white hover:bg-gray-50 text-gray-700 border shadow-md"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* </CardContent>
      </Card> */}

      {/* Location Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <div className="flex gap-2">
                <Input id="latitude" value={location?.lat.toFixed(6) || ""} readOnly className="bg-gray-50" />
              </div>
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <div className="flex gap-2">
                <Input id="longitude" value={location?.lng.toFixed(6) || ""} readOnly className="bg-gray-50" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" value={address} readOnly className="bg-gray-50" />
          </div>


        </CardContent>
      </Card>
    </div>
  )
}
