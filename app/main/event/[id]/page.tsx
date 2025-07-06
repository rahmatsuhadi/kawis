import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, User, CalendarDays, ArrowLeft, Heart, Bookmark, Instagram, Link2, Facebook } from "lucide-react"
import EventImageDetail from "@/components/event/CardEventImage"
import { Metadata } from "next"
import { Event, EventCategory, EventImage } from "@prisma/client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

import { PostResponse } from "@/components/post/Post"
import Image from "next/image"
import RadarMaps from "@/components/event/RadarMap"
import InlinePostContent from "@/components/post/InlinePostContent";

interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Detail Event',
};

// Fungsi untuk mengambil detail event dari API
export async function getEventDetail(id: string): Promise<EventDetail | null> {
    // Gunakan NEXT_PUBLIC_APP_URL untuk absolute URL saat fetch dari Server Component
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Fallback for development
    const res = await fetch(`${apiUrl}/api/events/${id}`, {
        cache: 'no-store' // Pastikan data selalu segar
    });

    if (!res.ok) {
        // console.error(`Failed to fetch event details for ID ${id}: ${res.status} ${res.statusText}`);
        // Jika event tidak ditemukan atau tidak disetujui, kembalikan null
        if (res.status === 404) return null;
        // Untuk error lain, lempar error agar bisa ditangkap oleh error boundary atau fallback
        throw new Error(`Failed to fetch event details: ${res.statusText}`);
    }
    return res.json();
}




interface EventDetail extends Event {
    images: EventImage[];
    posts: PostResponse[];
    eventCategories?: {
    category: {
      id: string;
      name: string;
      slug: string;
    }
  }[];
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
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Link href={`/main`}>
                    <Button variant="ghost" className="mb-4 text-orange-500 hover:text-orange-600">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                </Link>

                {/* Event Section */}
                <div className="lg:col-span-2 mb-4">
                    <Card className="flex flex-col lg:flex-row items-start p-4 lg:p-6">
                        {/* Event Image */}
                        <div className="flex-shrink-0 mb-4 lg:mb-0 lg:mr-6">
                            <Image
                                src={event.images[0]?.imageUrl || "/placeholder.svg?height=400&width=800"}
                                alt="Event Image"
                                width={160}
                                height={160}
                                className="rounded-lg object-cover"
                            />
                        </div>
                        {/* Event Info */}
                        <div className="flex-1 w-full">
                            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{event.name}</h1>
                            <div className="flex flex-row sm:flex-row sm:items-center sm:space-x-6 text-sm mb-2">
                                <div className="flex items-center space-x-2 mb-1 sm:mb-0">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium">{event.address || 'Alamat tidak tersedia'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CalendarDays className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium">
                                        {format(new Date(event.startDate), "dd MMM yyyy", { locale: id })} - {format(new Date(event.endDate), "dd MMM yyyy", { locale: id })}
                                    </span>
                                    <span className="text-gray-400">
                                        ({format(new Date(event.startDate), "HH:mm", { locale: id })} - {format(new Date(event.endDate), "HH:mm", { locale: id })})
                                    </span>
                                </div>
                            </div>
                            {/* Like & Save Buttons */}
                            {/* <div className="flex space-x-3 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-400 border-white hover:bg-white hover:text-gray-800 bg-transparent"
                                >
                                    <Heart className="w-4 h-4 mr-2" />
                                    Like
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-400 border-white hover:bg-white hover:text-gray-800 bg-transparent"
                                >
                                    <Bookmark className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div> */}
                        </div>
                    </Card>
                </div>

                {/* Location Map */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                         <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-4 lg:p-6">
                                    <h3 className="text-base lg:text-lg font-semibold mb-4">Lokasi Event</h3>
                                    <div className="flex justify-center mb-4">
                                        <div className="w-24 lg:w-32 flex justify-center">
                                            {/* Menggunakan data latitude, longitude dari event */}
                                            <RadarMaps
                                                eventLocation={{
                                                    name: event.name,
                                                    latitude: Number(event.latitude),
                                                    longitude: Number(event.longitude),
                                                }}
                                                height={300}
                                                width={300}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs lg:text-sm text-gray-600 mb-2">Alamat:</p>
                                        {/* Asumsi Anda punya kolom 'address' di event, atau gunakan description jika tidak */}
                                        <p className="font-medium text-sm lg:text-base">{event.address || 'Alamat tidak tersedia'}</p>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4 border-orange-500 text-orange-500 hover:bg-orange-50 text-sm lg:text-base">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Lihat di Maps
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Postingan terkait event (jika Anda ingin menampilkannya di halaman ini) */}
                             {/* Post Something Button */}
                            <div className="flex justify-between items-center mt-8 mb-5">
                                <h2 className="text-2xl lg:text-3xl font-bold">Postingan Terkait</h2>
                                <Link href={`/main/event/${event.id}/post-create`}>
                                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 lg:px-12 py-2 lg:py-3 text-base lg:text-lg w-full sm:w-auto">
                                        Post Something

                                    </Button>
                                </Link>

                            </div>
                            {event.posts && event.posts.length > 0 ? (
                                <div className="space-y-6">
                                    {event.posts.map((post) => (
                                        <Card key={post.id} className="p-4">
                                            <CardContent>
                                            <InlinePostContent content={post.content} />
                                            {post.images && post.images.length > 0 && (
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                                {post.images.map((postImg) => (
                                                    <div key={postImg.id} className="relative w-full h-32 rounded-lg overflow-hidden">
                                                    <Image src={postImg.imageUrl} alt="Post Image" fill style={{ objectFit: "cover" }} className="rounded-lg" />
                                                    </div>
                                                ))}
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-500 mt-2">
                                                Dibuat oleh: {post.postedByName || 'Anonim'} pada {format(new Date(post.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                                            </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Belum ada postingan terkait event ini.</p>
                            )}
                         </div>


                         <div className="lg:col-span-1 space-y-4 lg:space-y-6">

                            <Card>
                                <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Deskripsi Event</h3>
                                <p className="text-gray-600 text-sm mb-6">{event.description}</p>

                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Kategori</h4>
                                    {event.eventCategories && event.eventCategories.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                        {event.eventCategories.map((i) => (
                                            <span
                                            key={i.category.id}
                                            className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                            >
                                            {i.category.name}
                                            </span>
                                        ))}
                                        </div>
                                    ) : (
                                        <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                        Kategori tidak tersedia
                                        </span>
                                    )}
                                </div>

                                {/* <div>
                                    <h4 className="font-medium mb-3">Share Event</h4>
                                    <div className="flex space-x-3">
                                        <Button size="sm" variant="outline" className="p-2 bg-transparent">
                                            <Instagram className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" className="p-2 bg-transparent">
                                            <Facebook className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" className="p-2 bg-transparent">
                                            <Link2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div> */}
                                </CardContent>
                            </Card>
                         </div>
                    </div>
            
            </div>
        </main>
    )
}