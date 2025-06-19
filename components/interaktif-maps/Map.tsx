"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"
import { useQuery } from "@tanstack/react-query"
import { EventsApiResponse, fetchEvents } from "../event/EventList"

// const sampleLocations = [
//   { id: 1, name: "Warung Padang Sederhana", type: "restaurant", lat: -6.2088, lng: 106.8456, icon: "🍽️" },
//   { id: 2, name: "Starbucks Coffee", type: "cafe", lat: -6.2095, lng: 106.8465, icon: "☕" },
//   { id: 3, name: "Mall Taman Anggrek", type: "shopping", lat: -6.207, lng: 106.844, icon: "🛍️" },
//   { id: 4, name: "Cafe Kopi Kenangan", type: "cafe", lat: -6.21, lng: 106.847, icon: "☕" },
//   { id: 5, name: "Restoran Sunda", type: "restaurant", lat: -6.2085, lng: 106.8445, icon: "🍽️" },
//   { id: 6, name: "Coworking Space", type: "workspace", lat: -6.2075, lng: 106.846, icon: "💼" },
//   { id: 7, name: "Pizza Hut", type: "restaurant", lat: -6.211, lng: 106.848, icon: "🍕" },
//   { id: 8, name: "Indomaret", type: "shopping", lat: -6.2065, lng: 106.8435, icon: "🛒" },
// ]

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Function to create circle GeoJSON - Fixed
function createCircle(center: [number, number], radiusKm: number, points = 64) {
  const coords = []
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180))
  const distanceY = radiusKm / 110.54

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    const x = distanceX * Math.cos(theta)
    const y = distanceY * Math.sin(theta)
    coords.push([center[0] + x, center[1] + y])
  }
  coords.push(coords[0]) // Close the circle

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: [coords],
        },
        properties: {},
      },
    ],
  }
}
export default function LocationRadar() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radarRadius, setRadarRadius] = useState("2")
  const [isLocating, setIsLocating] = useState(false)


  const {
    data,
  } = useQuery<EventsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
    queryKey: ["events",],
    queryFn: fetchEvents,
    refetchOnWindowFocus: true,
  });
  const events = useMemo(() => data?.events || [],[]);

  const getCurrentLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setUserLocation({ lat: -6.2088, lng: 106.8456 })
          setIsLocating(false)
        },
      )
    } else {
      setUserLocation({ lat: -6.2088, lng: 106.8456 })
      setIsLocating(false)
    }
  }

  const locationsInRange = useMemo(() => {
    if (!userLocation) return []
    return events.filter((location) => {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, Number(location.latitude), Number(location.longitude))
      const withinRadius = distance <= Number.parseFloat(radarRadius)
      return withinRadius
    })
  }, [userLocation, radarRadius, events])

  // Create radar circle GeoJSON
  const radarCircle = useMemo(() => {
    if (!userLocation) return null
    return createCircle([userLocation.lng, userLocation.lat], Number.parseFloat(radarRadius))
  }, [userLocation, radarRadius])

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Controls */}
      <div className="flex gap-3 items-center mb-4">
        <div className="flex justify-between items-center">
          {/* <span className="text-sm font-medium">Radius: {radarRadius} km</span> */}
          {/* <span className="text-sm text-muted-foreground ml-4">{locationsInRange.length} lokasi</span> */}
        </div>
        <Select value={radarRadius} onValueChange={setRadarRadius}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Pilih radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 km</SelectItem>
            <SelectItem value="5">5 km</SelectItem>
            <SelectItem value="10">10 km</SelectItem>
            <SelectItem value="20">20 km</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={getCurrentLocation}
          disabled={isLocating}
          size="sm"
          className="bg-orange-500 hover:bg-orange-600"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {isLocating ? "Mencari Lokasi..." : "Lokasi Saya"}
        </Button>
      </div>

      <div className="">

        {/* Circular Radar Map */}
        <div className="relative">
          {/* Orange border circle */}
          <div className="absolute inset-0 lg:w-[500px] w-80 h-80 lg:h-[500px] rounded-full border-4 border-orange-500 z-10 pointer-events-none"></div>

          {/* Map container with circular clip */}
          <div className="lg:w-[500px] w-80 h-80 lg:h-[500px] rounded-full overflow-hidden bg-white shadow-2xl">
            {userLocation && (
              <Map
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                initialViewState={{
                  longitude: userLocation.lng,
                  latitude: userLocation.lat,
                  zoom: 13,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL}
                attributionControl={false}
              >
                {/* Custom background layer */}
                {/* <Source
                id="background"
                type="geojson"
                data={{
                  type: "FeatureCollection",
                  features: [],
                }}
              >
                <Layer
                  id="background-layer"
                  type="background"
                  paint={{
                    "background-color": "#7dd3c0",
                  }}
                />
              </Source> */}

                {/* Radar Circle */}
                {radarCircle && (
                  <Source id="radar-circle" type="geojson" data={radarCircle}>
                    <Layer
                      id="radar-circle-fill"
                      type="fill"
                      paint={{
                        "fill-color": "#3b82f6",
                        "fill-opacity": 0.15,
                      }}
                    />
                    <Layer
                      id="radar-circle-stroke"
                      type="line"
                      paint={{
                        "line-color": "#3b82f6",
                        "line-width": 2,
                        "line-dasharray": [5, 5],
                      }}
                    />
                  </Source>
                )}

                {/* Center marker (user location) */}
                <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                  <div className="w-10 h-10 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                </Marker>

                {/* Location markers */}
                {locationsInRange.map((location) => (
                  <Marker
                    key={location.id}
                    longitude={Number(location.longitude)}
                    latitude={Number(location.latitude)}
                    anchor="center"
                  >
                    <div className="relative group">
                      {/* Small marker dot */}
                      <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"></div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {location.name}
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                      </div>
                    </div>
                  </Marker>
                ))}
              </Map>
            )}
          </div>
        </div>

        {/* Location list */}
        <Card className="mt-6 w-full max-w-md">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 text-center">Lokasi Terdeteksi</h3>
            <div className="space-y-2">
              {locationsInRange.map((location) => (
                <div key={location.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {/* <span className="text-lg">{location.icon}</span> */}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{location.name}</p>
                    {/* <p className="text-xs text-gray-500 capitalize">{location.type}</p> */}
                  </div>
                  <div className="text-xs text-gray-400">
                    {userLocation &&
                      `${calculateDistance(userLocation.lat, userLocation.lng, Number(location.latitude), Number(location.longitude)).toFixed(1)} km`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
