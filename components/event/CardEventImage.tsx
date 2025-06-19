import Image from "next/image";
import { Card } from "../ui/card";
import {  EventImage } from "@prisma/client";




export default function EventImageDetail({ images }: { images: EventImage[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Main Poster Image */}


            {/* Additional Images / Gambar Tambahan */}
            {/* Tampilkan gambar tambahan hanya jika ada lebih dari satu gambar */}
            {images && images.length > 1 ? (
                <div className="lg:col-span-2 grid grid-cols-2 gap-2 lg:gap-4">
                    {/* Gunakan .slice(1) untuk melewati gambar pertama yang sudah jadi main poster */}
                    {images.map((item, i) => (
                        <div key={i} className="lg:col-span-1">
                            <Card  className="overflow-hidden">
                                {/* Pembungkus relative dengan tinggi yang jelas agar Image fill */}
                                <div className="relative w-full h-60 lg:h-80">
                                    <Image
                                        src={item.imageUrl || "/placeholder.svg"}
                                        alt="Event Main Poster"
                                        layout="fill" // Gambar akan mengisi parent-nya
                                        objectFit="cover" // Gambar akan menutupi area tanpa distorsi
                                        className="rounded-lg" // Menjaga border-radius
                                    />
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                // Jika hanya ada satu gambar atau tidak ada gambar sama sekali
                images && images.length === 1 && (
                    <div className="lg:col-span-2 flex items-center justify-center">
                        <p className="text-gray-500">Tidak ada gambar tambahan untuk event ini.</p>
                    </div>
                )
            )}

            {/* Handle case where there are no images at all for the entire section */}
            {(!images || images.length === 0) && (
                <div className="lg:col-span-3 text-center py-8">
                    <p className="text-gray-500">Tidak ada gambar yang tersedia untuk event ini.</p>
                </div>
            )}
        </div>
    )
}