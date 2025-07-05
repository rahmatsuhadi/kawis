import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, User, CalendarDays } from "lucide-react"
import EventImageDetail from "@/components/event/CardEventImage"
import { Metadata } from "next"
import { Event, EventImage } from "@prisma/client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

import { PostResponse } from "@/components/post/Post"
import Image from "next/image"
import RadarMaps from "@/components/event/RadarMap"

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
    posts: PostResponse[]
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
                {/* Event Images Section */}
                <EventImageDetail images={event.images} />
                {/* Event Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Event Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-4 lg:p-6">
                                <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">{event.name}</h1>


                                <div className="text-gray-700 leading-relaxed mb-6 lg:mb-8 text-sm lg:text-base" dangerouslySetInnerHTML={{ __html: event.description || '' }}></div>

                                <Separator className="my-4 lg:my-6" />

                                {/* Event Metadata */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-600">
                                            <CalendarDays className="w-4 h-4 mr-2" />
                                            <span className="font-medium text-sm lg:text-base">Tanggal Mulai</span>
                                        </div>
                                        <p className="text-gray-900 text-sm lg:text-base">{format(new Date(event.startDate), "dd MMMM yyyy", { locale: id })}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span className="font-medium text-sm lg:text-base">Tanggal Selesai</span>
                                        </div>
                                        <p className="text-gray-900 text-sm lg:text-base">{format(new Date(event.endDate), "dd MMMM yyyy", { locale: id })}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-600">
                                            <User className="w-4 h-4 mr-2" />
                                            <span className="font-medium text-sm lg:text-base">Created By</span>
                                        </div>
                                        <p className="text-gray-900 text-sm lg:text-base">{event.anonymousName}</p>
                                    </div>
                                </div>

                                <Separator className="my-4 lg:my-6" />

                                {/* Post Something Button */}
                                <div className="flex justify-center">
                                    <Link href={`/main/event/${event.id}/post-create`}
                                    >
                                        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 lg:px-12 py-2 lg:py-3 text-base lg:text-lg w-full sm:w-auto">
                                            Post Something

                                        </Button>
                                    </Link>

                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Location Map and Stats */}
                    <div className="lg:col-span-1 space-y-4 lg:space-y-6">
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
                                {/* <Button variant="outline" className="w-full mt-4 border-orange-500 text-orange-500 hover:bg-orange-50 text-sm lg:text-base">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Lihat di Maps
                                </Button> */}
                            </CardContent>
                        </Card>

                        {/* Event Stats (Dummy Data) */}
                        {/* <Card>
                            <CardContent className="p-4 lg:p-6">
                                <h3 className="text-base lg:text-lg font-semibold mb-4">Statistik Event</h3>
                                <div className="space-y-3 lg:space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-sm lg:text-base">Tertarik</span>
                                        <span className="font-semibold text-sm lg:text-base">245 orang</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-sm lg:text-base">Akan Hadir</span>
                                        <span className="font-semibold text-sm lg:text-base">89 orang</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-sm lg:text-base">Dibagikan</span>
                                        <span className="font-semibold text-sm lg:text-base">32 kali</span>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full text-sm lg:text-base">
                                        Tertarik
                                    </Button>
                                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-sm lg:text-base">
                                        Akan Hadir
                                    </Button>
                                </div>
                            </CardContent>
                        </Card> */}
                    </div>
                </div>

                {/* Postingan terkait event (jika Anda ingin menampilkannya di halaman ini) */}
                <h2 className="text-2xl lg:text-3xl font-bold mt-8 mb-4">Postingan Terkait</h2>
                {event.posts && event.posts.length > 0 ? (
                    <div className="space-y-6">
                        {event.posts.map((post) => (
                            <Card key={post.id} className="p-4">
                                <CardContent>
                                    <div className="" dangerouslySetInnerHTML={{ __html: post.content || '' }}></div>
                                    {/* <p className="text-gray-800 mb-2">{}</p> */}
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
                                        {post.postedByName || 'Anonim'} pada {format(new Date(post.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Belum ada postingan terkait event ini.</p>
                )}
            </div>
        </main>
    )
}