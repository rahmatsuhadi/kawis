"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Home, MapPin, MessageCircle, Search } from "lucide-react"
import { useSession } from "next-auth/react";
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation";
{/* Mobile Bottom Navigation */ }
export default function Navigation() {
    const router = useRouter();
    const pathname = usePathname(); // Hook untuk mendapatkan path URL saat ini
    const { data: session, status } = useSession(); // Dapatkan sesi user

    // Helper untuk menentukan apakah link aktif
    const isActive = (path: string) => pathname === path;

    // Tentukan apakah user adalah admin
    const isAdmin = status === "authenticated" && session?.user?.role === "ADMIN";
    return (

        < div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2" >
            <div className="flex justify-around">
                <Button variant={"ghost"} size="sm" className={`flex flex-col items-center p-2 ${isActive("/main") ? 'text-orange-500' : 'text-gray-500'} `}>
                    <Link href="/main">
                        <Home className="w-5 h-5" />
                        <span className="text-xs mt-1">Home</span>
                    </Link>
                </Button>
                <Button
                    variant={"ghost"}
                    asChild
                    size="sm"
                    className={`flex flex-col items-center p-2 ${isActive("/main/maps") ? 'text-orange-500' : 'text-gray-500'} `}
                    onClick={() => console.log("maps")}
                >
                    <Link href="/main/maps">
                        <MapPin className="w-5 h-5" />
                        <span className="text-xs mt-1">Maps</span>
                    </Link>
                </Button>
                <Button variant="ghost" size="sm" className="flex flex-col items-center p-2 text-gray-500">
                    <Search className="w-5 h-5" />
                    <span className="text-xs mt-1">Explore</span>
                </Button>
                <Button
                    className={`flex flex-col items-center p-2 ${isActive("/main/event-create") ? 'text-orange-500' : 'text-gray-500'} `}
                    variant={"ghost"}
                    asChild
                    size="sm"
                    onClick={() => console.log("post-event")}
                >
                    <Link href={"/main/event-create"}>
                        <Calendar className="w-5 h-5" />
                        <span className="text-xs mt-1"> Add Event</span>
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center p-2 text-gray-500"
                    onClick={() => console.log("messaging")}
                >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs mt-1">Message</span>
                </Button>
            </div>
        </div >
    )
}