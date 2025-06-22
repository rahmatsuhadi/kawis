"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox"
import { Info, MapPin, Navigation, Target } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"
import { useQuery } from "@tanstack/react-query"
import { EventResponse, EventsApiResponse, fetchEvents } from "../event/EventList"
import { useGeolocation } from "@/context/geolocation-context"
import { Separator } from "../ui/separator"
import Link from "next/link"

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


  const { location: userLocation, radius: radarRadius } = useGeolocation()


  const {
    data,
  } = useQuery<EventsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
    enabled: !!userLocation,
    queryKey: ["events", userLocation?.latitude, userLocation?.longitude, radarRadius],
    queryFn: fetchEvents,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,

  });
  const events = useMemo(() => data?.events || [], [data]);





  const locationsInRange = useMemo(() => {
    if (!userLocation) return []
    return events.filter((location) => {
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, Number(location.latitude), Number(location.longitude))
      const withinRadius = distance <= Number.parseFloat(radarRadius)
      return withinRadius
    })
  }, [userLocation, radarRadius, events])

  // Create radar circle GeoJSON
  const radarCircle = useMemo(() => {
    if (!userLocation) return null
    return createCircle([userLocation.longitude, userLocation.latitude], Number.parseFloat(radarRadius))
  }, [userLocation, radarRadius])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = React.useRef<any>(null)
  const [isRecentering, setIsRecentering] = useState(false)

  // Function to recenter map to user location
  const recenterToUserLocation = () => {
    if (userLocation && mapRef.current) {
      setIsRecentering(true)

      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
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

  return (



    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Event Radar</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Temukan event menarik di sekitar Anda dengan radar interaktif. Jelajahi berbagai acara dalam radius yang dapat
          disesuaikan.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="text-center">
          <CardContent className="pt-4">

            <div className="text-2xl font-bold text-gray-800">{locationsInRange.length}</div>
            <div className="text-sm text-gray-600">Event Terdeteksi</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-4">

            <div className="text-2xl font-bold text-gray-800">{radarRadius} KM</div>
            <div className="text-sm text-gray-600">Radius Pencarian</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-4">

            <div className="text-2xl font-bold text-gray-800">Real-time</div>
            <div className="text-sm text-gray-600">Update Otomatis</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Radar Map */}


      {/* Instructions & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div className="w-full justify-center">
          <div className="relative flex justify-center">
            {/* Map container with circular clip */}
            <div className="lg:w-[500px] w-80 h-80 lg:h-[500px] rounded-full overflow-hidden bg-white shadow-2xl border-orange-500 border-4 relative">
              {userLocation && (
                <Map
                  ref={mapRef}
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                  initialViewState={{
                    longitude: userLocation.longitude,
                    latitude: userLocation.latitude,
                    zoom: 13,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL}
                  attributionControl={false}
                >
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
                  <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </Marker>

                  {/* Location markers */}
                  {/* {locationsInRange.map((location) => ( */}
                  <MapMarkers locations={locationsInRange} />
                  {/* ))} */}
                </Map>
              )}

              {/* Floating Recenter Button */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  onClick={recenterToUserLocation}
                  disabled={isRecentering || !userLocation}
                  size="sm"
                  className="bg-white hover:bg-gray-50 text-gray-700 border shadow-md rounded-full w-10 h-10 p-0"
                  title="Posisikan ke lokasi saya"
                >
                  <Navigation className={`h-4 w-4 ${isRecentering ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Radar Pulse Effect */}
              <div className="absolute inset-0 rounded-full pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Location list */}
        <Card className="mt-6 w-full max-w-md">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 text-center">Lokasi Terdeteksi</h3>
            <div className="space-y-2">
              {locationsInRange.map((location) => (
                <Link key={location.id} href={"/main/event/" + location.slug}>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div

                      className="w-8 h-8 rounded-full bg-red-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{location.name}</p>
                      {/* <p className="text-xs text-gray-500 capitalize">{location.type}</p> */}
                    </div>
                    <div className="text-xs text-gray-400">
                      {userLocation &&
                        `${calculateDistance(userLocation.latitude, userLocation.longitude, Number(location.latitude), Number(location.longitude)).toFixed(
                          1
                        )} km`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keterangan & Legenda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-green-500" />
              Keterangan Peta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Legend Items */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Lokasi Anda</p>
                  <p className="text-xs text-gray-600">Posisi saat ini dengan animasi pulse</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                <div>
                  <p className="font-medium text-sm">Event Tersedia</p>
                  <p className="text-xs text-gray-600">Acara dalam radius pencarian Anda</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-blue-500 border-dashed border border-blue-300"></div>
                <div>
                  <p className="font-medium text-sm">Area Radar</p>
                  <p className="text-xs text-gray-600">Lingkaran biru menunjukkan radius pencarian</p>
                </div>
              </div>

              <Separator />

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>💡 Tips:</strong> Gunakan radius yang lebih kecil untuk hasil yang lebih akurat, atau perbesar
                  radius untuk menemukan lebih banyak event.
                </p>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700">
                  <strong>🎯 Update Real-time:</strong> Peta akan otomatis memperbarui event berdasarkan lokasi dan
                  radius yang Anda pilih.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center md:mb-0 mb-20">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={recenterToUserLocation}
            disabled={isRecentering || !userLocation}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Navigation className={`h-4 w-4 mr-2 ${isRecentering ? "animate-spin" : ""}`} />
            {isRecentering ? "Memposisikan..." : "Posisikan Lokasi Saya"}
          </Button>

          <Button variant="outline" onClick={() => window.location.reload()}>
            <Target className="h-4 w-4 mr-2" />
            Refresh Event
          </Button>
        </div>
      </div>
    </div>

  )
}


const MapMarkers = ({ locations }: { locations: EventResponse[] }) => {
  const [activeMarker, setActiveMarker] = useState<string | null>(null); // Menyimpan marker aktif yang sedang diklik
  const [isMobile, setIsMobile] = useState(false); // Untuk mendeteksi apakah perangkat mobile

  // Efek untuk mendeteksi ukuran layar (mobile vs desktop)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Tentukan apakah ini perangkat mobile
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Pastikan untuk memanggil saat pertama kali

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClick = (id: string) => {
    if (isMobile) {
      // Jika perangkat mobile, toggle visibility tooltip
      setActiveMarker(id === activeMarker ? null : id); // Toggle visibility
    }
  };

  return (
    <>
      {locations.map((location) => (
        <Marker
          key={location.id}
          longitude={Number(location.longitude)}
          latitude={Number(location.latitude)}
          anchor="center"
        >
          <div className="relative group">
            {/* Small marker dot */}
            <div
              className="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
              onClick={() => handleClick(location.id)} // Handle click on mobile
            ></div>

            {/* Tooltip (hover on desktop, click on mobile) */}
            {(isMobile ? activeMarker === location.id : false) || !isMobile ? ( // Show tooltip on click (mobile) or hover (desktop)
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-100 transition-opacity pointer-events-none z-10">
                {location.name}
                {location.distanceKm && (
                  <div className="text-xs opacity-75">
                    {location.distanceKm.toFixed(1)} km
                  </div>
                )}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
              </div>
            ) : null}
          </div>
        </Marker>
      ))}
    </>
  );
};