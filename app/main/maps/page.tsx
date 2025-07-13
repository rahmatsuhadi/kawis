
"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox"
import { Calendar, Clock, Info, MapPin, Navigation, Users } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"
import { QueryFunctionContext, useQuery } from "@tanstack/react-query"
import { useGeolocation } from "@/context/geolocation-context"
import Link from "next/link"

import  { EventsApiResponse } from "@/components/event/EventList";
import { Separator } from "@/components/ui/separator"
import MapMarkers from "@/components/interaktif-maps/MapMarker"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Category } from "@prisma/client"
import { MultiSelect } from "@/components/ui/multi-select"
import { formatDate, formatTime } from "@/lib/formater"
import EventCardSkeleton from "@/components/event/EventSkletonCard"
import getInitialName from "@/lib/getInitialName"
import { formatRupiah } from "@/lib/format-rupiah"


export async function fetchEvents(context: QueryFunctionContext): Promise<EventsApiResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_key, lat, lng, radius, categories] = context.queryKey as [string, number?, number?, number?, string[]?]

    // Perbaiki URL untuk menyertakan query parameters
    let url = `/api/events/nearby`;

    url += `?lat=${lat}&lng=${lng}&sort=distance`;

    // Radius opsional
    if (!!radius) {
        url += `&radius=${radius}&`;
    }

    if (categories && categories.length > 0) {
        url += `&categories=${categories}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memuat event.");
    }
    const data: EventsApiResponse = await response.json(); // Cast data ke tipe yang benar
    return data;
}



export default function Maps() {

    const { location: userLocation, radius: radarRadius } = useGeolocation()
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);




    // Category data fetch
    const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<Category[], Error>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to load categories.");
            }
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });
    const categories = categoriesData || [];
    // const categoryOptions = [{ value: "all", label: "Semua Kategori" }, ...categories.map(cat => ({ value: cat.id, label: cat.name }))];

    const categoryOptions = categories.map(cat => ({
        value: cat.id,
        label: cat.name,
    }));

    const {
        isLoading,
        data,
    } = useQuery<EventsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
        enabled: !!userLocation,
        queryKey: ["events-nearby", userLocation?.latitude, userLocation?.longitude, radarRadius, selectedCategoryIds],
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

        <>
            <main className="flex-1 overflow-y-auto p-4">

                <div className="w-full space-y-6">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-8 text-white">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-bold mb-4">Temukan Event Menarik di Sekitarmu</h2>
                            <p className="text-orange-100 text-lg mb-6">
                                Jelajahi berbagai acara menarik berdasarkan lokasi dan minatmu. Bergabunglah dengan komunitas dan ciptakan
                                pengalaman tak terlupakan.
                            </p>
                        </div>
                    </div>




                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 mx-auto">
                            {/* <div className="w-full justify-center"> */}
                            <div className="relative flex justify-center flex-col col-span-4 ">
                                <h2 className="text-base xl:text-xl font-semibold text-gray-900 ml-6 mb-4">Events Maps</h2>

                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mb-5 mx-6">
                                    <p className="text-xs text-orange-700">
                                        <strong>🎯 Update Real-time:</strong> Peta akan otomatis memperbarui event berdasarkan lokasi dan
                                        radius yang Anda pilih.
                                    </p>
                                </div>
                                {/* Map container with circular clip */}
                                <div className="w-[96%] h-[600px] overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg mx-6 mb-6 relative">

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


                                {/* Keterangan & Legenda */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Info className="h-5 w-5 text-green-500" />
                                            Keterangan Peta
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent >
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



                                        </div>

                                    </CardContent>
                                </Card>



                            </div>
                            {/* </div> */}

                            {/* Events List */}
                            <div className="space-y-4 col-span-2">
                                <div className="flex flex-col">
                                    <h2 className="text-base xl:text-xl  font-semibold text-gray-900">Event Terdekat</h2>
                                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                                        {events.length} event ditemukan
                                    </Badge>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-4">


                                    <MultiSelect
                                        options={categoryOptions}
                                        selected={selectedCategoryIds}
                                        onChange={setSelectedCategoryIds}
                                        placeholder={isLoadingCategories ? "Memuat kategori..." : (categories.length === 0 ? "Tidak ada kategori tersedia" : "Semua Kategori")}

                                    />
                                    {/* {isErrorEvents && <p className="text-red-500 text-xs mt-1">Failed to load categories.</p>} */}
                                </div>

                                <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                                    {isLoading && Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
                                    {events.map((event) => (
                                        <Card
                                            key={event.id}
                                            className="hover:shadow-lg transition-all duration-300 cursor-pointer border shadow-md hover:shadow-orange-100"
                                        >
                                            {/* Wrap CardContent with Link to make the entire card clickable to event details */}
                                            <Link href={`/main/e/${event.slug}`} className="block">
                                                <CardContent className="p-3">
                                                    <div className="flex gap-4">
                                                        {/* Event Image (Square) */}
                                                        <div className="relative w-10 h-10 xl:w-20 xl:h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={event.images[0] || "/placeholder.jpg"} // Use optional chaining for images[0]
                                                                alt={event.name}
                                                                layout="fill" // Fill the parent div
                                                                objectFit="cover" // Cover the area, cropping if needed
                                                                className="rounded-lg"
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-gray-900 hover:text-orange-600 line-clamp-1 transition-colors">
                                                                        {event.name}
                                                                    </h3>
                                                                    {/* Event Location / Address */}
                                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                        <MapPin className="h-3 w-3 mr-1 text-orange-500 shrink-0" />
                                                                        <span className="truncate max-w-full lg:max-w-xs">{event.address || "Location not specified"}</span>
                                                                    </div>
                                                                </div>
                                                                {/* Distance Badge */}
                                                                {event.distanceKm !== null && (
                                                                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 flex-shrink-0 ml-2">
                                                                        {event.distanceKm.toFixed(1)} km
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Date and Time */}
                                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                <div className="flex items-center">
                                                                    <Calendar className="h-3 w-3 mr-1 text-orange-500" />
                                                                    {formatDate(event.startDate)}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Clock className="h-3 w-3 mr-1 text-orange-500" />
                                                                    {formatTime(event.startDate)}
                                                                </div>
                                                            </div>

                                                            {/* Organizer and Categories */}
                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="flex items-center gap-2">
                                                                    {/* Organizer Avatar and Name */}
                                                                    {event.organizerName && (
                                                                        <>
                                                                            <Avatar className="h-6 w-6">
                                                                                <AvatarImage src={"/placeholder-org.svg"} /> {/* Replace with actual organizer avatar if available */}
                                                                                <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                                                                                    {getInitialName(event.organizerName)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="text-xs text-gray-600 truncate flex-shrink-0">{event.organizerName}</span>
                                                                        </>
                                                                    )}
                                                                    {/* Category Badge (displaying first category, if multiple exist) */}
                                                                    {event.categories && event.categories.length > 0 && (
                                                                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 ml-2">
                                                                            {event.categories[0].name}
                                                                        </Badge>
                                                                    )}
                                                                    {/* {event.categories.map((item, i) =>(
                                                                         <Badge key={i} variant="outline" className="text-xs border-orange-200 text-orange-700 ml-2">
                                                                            {item.name}
                                                                        </Badge>
                                                                    ))} */}

                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                                                                    {/* Attendees (Dummy for now, integrate actual count from DB later) */}
                                                                    <div className="flex items-center">
                                                                        <Users className="h-3 w-3 mr-1 text-orange-500" />
                                                                        {1} {/* Use attendeeCount prop */}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Price and Action Buttons */}
                                                            <div className="flex items-center justify-between mt-3">
                                                                {/* Price (Dummy for now) */}
                                                                <span className="font-semibold text-orange-600 text-sm">{formatRupiah(event.price?.toString())}</span> {/* Example price: Free */}
                                                                <div className="flex gap-1">
                                                                   
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Link>
                                        </Card>
                                    ))}

                                </div>
                            </div>

                        </div>


                    </div>






                </div>
            </main>


            {/* EventList: Tetap kanan */}
            {/* <aside className=" shrink-0 overflow-y-auto border-l sticky h-[calc(100vh-64px)]"> */}
            {/* <EventList /> */}
            {/* </aside> */}

        </>
    )
}



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


