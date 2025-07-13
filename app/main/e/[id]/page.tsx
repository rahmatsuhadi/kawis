
import { Button } from "@/components/ui/button"
import { Card, CardContent, } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    MapPin,
    Calendar,
    Heart,
    Bookmark,
    Clock,
} from "lucide-react"
import Image from "next/image"
import { Event, User } from "@prisma/client"
import getInitialName from "@/lib/getInitialName"
import { formatDate, formatTime } from "@/lib/formater"
import RadarMaps from "@/components/event/RadarMap"
import ButtonMaps from "@/components/event/ButtonToMaps"
import CardCreatePost from "@/components/post/CardCreatePost"
import PostEventDetail from "@/components/post/PostEventDetail"
import { formatRupiah } from "@/lib/format-rupiah"





interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}


export interface EventDetail extends Event {
    eventCategories?: {
        category: {
            id: string;
            name: string;
            slug: string;
        }
    }[];
    createdBy: User
}


// Fungsi untuk mengambil detail event dari API
export async function getEventDetail(id: string): Promise<EventDetail | null> {
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/events/${id}`, {
        cache: 'no-store' // Pastikan data selalu segar
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        // Untuk error lain, lempar error agar bisa ditangkap oleh error boundary atau fallback
        throw new Error(`Failed to fetch event details: ${res.statusText}`);
    }
    return res.json();
}


export default async function EventDetailPage({ params }: EventDetailPageProps) {

    const event = await getEventDetail((await params).id);


    if (!event) {
        return (
            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-md mx-auto text-center p-8 bg-white shadow-lg rounded-lg my-8">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Event Tidak Ditemukan</h1>
                    <p className="text-gray-700">Maaf, event dengan ID ini tidak ditemukan atau belum disetujui oleh admin.</p>
                    <Button
                        // onClick={() => redirect('/main')}
                        className="mt-4 bg-orange-500 hover:bg-orange-600">
                        Kembali ke Halaman Utama
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4">

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Event Header */}
                <Card className="mb-6 shadow-lg border-0">
                    <CardContent className="p-0">
                        <div className="relative">
                            <Image
                                src={event.images[0] || "/placeholder.svg"}
                                alt={event.name}
                                width={800}
                                height={400}
                                className="w-full h-64 object-cover rounded-t-lg"
                            />
                            <div className="absolute top-4 right-4 flex flex-wrap gap-2">
                                {/* <Badge className="bg-orange-500 text-white">{event.category}</Badge> */}
                                {event.eventCategories && event.eventCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {event.eventCategories.map((category) => (
                                            <Badge key={category.category.id} className="bg-orange-500 text-white">
                                                {category.category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                {/* --- NEW: Display tags as badges --- */}
                                {event.tags && event.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags.map((tag) => (
                                            <Badge key={tag} className="bg-gray-700 text-white"> {/* Different color for tags */}
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
                                    <div className="flex items-center gap-4 text-gray-600">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                                            {formatDate(event.startDate) == formatDate(event.endDate) ? formatDate(event.startDate) : formatDate(event.startDate) + ' - ' + formatDate(event.endDate)}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                            {formatTime(event.startDate) + " -" + formatTime(event.endDate)}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                            {event.location || "Lokasi Acara tidak disetel"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                    >
                                        <Heart className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                    >
                                        <Bookmark className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>


                            <div className="text-gray-700 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description || "" }}></div>


                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={event.createdBy ? event.createdBy?.image as string : "/placeholder.jpg"} />
                                        <AvatarFallback className="bg-orange-100 text-orange-700">
                                            {getInitialName(event.organizerName || event.anonymousName || event.createdBy.name || "Anonymouse")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{event.organizerName || event.anonymousName || event?.createdBy?.name || "Anonymouse"}</h3>
                                    </div>
                                    {/* <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent"
                                    >
                                        Ikuti
                                    </Button> */}
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-600">

                                    <span className="font-semibold text-orange-600 text-lg">{formatRupiah(event.price?.toString())}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 lg:p-6">
                        <h3 className="text-base lg:text-lg font-semibold mb-4">Lokasi Event</h3>
                        <div className="flex justify-center mb-4">
                            {/* Map container - Berikan dimensi yang jelas agar RadarMaps mengisi penuh */}
                            <div className="w-full h-64 md:h-80 relative rounded-lg overflow-hidden shadow-md border border-gray-200"> {/* Tambah border untuk visual */}
                                {event.latitude !== null && event.longitude !== null ? ( // Pastikan koordinat ada
                                    <RadarMaps
                                        currentLocation={{ longitude: Number(event.longitude), latitude: Number(event.latitude) }}
                                        eventLocation={{
                                            name: event.name || "Lokasi Acara", // Gunakan event.name
                                            latitude: Number(event.latitude),
                                            longitude: Number(event.longitude),
                                            type: "event" // Tambahkan tipe untuk tooltip
                                        }}
                                        // Tampilkan lokasi pengguna jika tersedia (misal dari prop)
                                        // Jika ini Client Component, bisa pakai `userLoc={userLocation}` dari `useGeolocation`
                                        // userLoc={dummyUserLoc} // Ganti dengan userLocation dari context jika Client Component
                                        showRoute={true} // Tampilkan garis rute dari user ke event
                                        // zoomLevel={14} // Zoom lebih dekat untuk detail
                                        className="w-full h-full" // Buat RadarMaps mengisi div ini
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                                        Koordinat lokasi event tidak tersedia.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-xs lg:text-sm text-gray-600 mb-2">Alamat:</p>
                            <p className="font-medium text-sm lg:text-base">{event.address || 'Alamat tidak tersedia'}</p>
                        </div>
                        <ButtonMaps event={event} />

                    </CardContent>
                </Card>

                {/* Buat posting */}

                <CardCreatePost eventId={event.id} />


                {/* Event postingan */}

                <PostEventDetail eventId={event.id} />

            </div>


        </main>
    )
}
