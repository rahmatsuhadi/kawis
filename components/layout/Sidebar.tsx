"use client";

import { Button } from "@/components/ui/button";
import { Home, MapPin, Search, Calendar, Shield, Users } from "lucide-react";
import Link from "next/link"; // Import Link dari Next.js
import { usePathname } from "next/navigation"; // Import usePathname untuk menandai link aktif
import { useSession } from "next-auth/react"; // Import useSession untuk akses sesi

export default function Sidebar() {
  const pathname = usePathname(); // Hook untuk mendapatkan path URL saat ini
  const { data: session, status } = useSession(); // Dapatkan sesi user

  // Helper untuk menentukan apakah link aktif
  const isActive = (path: string) => pathname === path;

  // Tentukan apakah user adalah admin
  const isAdmin = status === "authenticated" && session?.user?.role === "ADMIN";

  return (
    <aside className="hidden lg:block max-w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <nav className="p-4 space-y-2">
        {/* Home */}
        <Button
          asChild // Render sebagai children, bukan button HTML
          variant={isActive("/main") ? "default" : "ghost"} // Highlight jika aktif
          className={`w-full justify-start ${isActive("/main") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
        >
          <Link href="/main">
            <Home className="w-5 h-5 mr-3" />
            Home
          </Link>
        </Button>

        {/* Interaktif Maps */}
        <Button
          asChild
          variant={isActive("/maps") ? "default" : "ghost"}
          className={`w-full justify-start ${isActive("/maps") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
        >
          <Link href="/main/maps">
            <MapPin className="w-5 h-5 mr-3" />
            Interaktif Maps
          </Link>
        </Button>

        {/* Explore */}
        <Button
          asChild
          variant={isActive("/main/explore") ? "default" : "ghost"}
          className={`w-full justify-start ${isActive("/main/explore") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
        >
          <Link href="/main/explore">
            <Search className="w-5 h-5 mr-3" />
            Explore
          </Link>
        </Button>

        {/* Post Event */}
       {session && (
         <Button
          asChild
          variant={isActive("/main/event-create") ? "default" : "ghost"} // Asumsi halaman create event adalah /main/event-create
          className={`w-full justify-start ${isActive("/main/event-create") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
        >
          <Link href="/main/event-create">
            <Calendar className="w-5 h-5 mr-3" />
            Post Event
          </Link>
        </Button>
       )}

        {/* Create Post */}
        {/* <Button
          asChild
          variant={isActive("/posts/create") ? "default" : "ghost"} // Asumsi halaman create post adalah /posts/create
          className={`w-full justify-start ${isActive("/posts/create") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
        >
          <Link href="/posts/create">
            <MessageCircle className="w-5 h-5 mr-3" />
            Create Post
          </Link>
        </Button> */}

        {/* Message */}
        {/* <Button
          asChild
          variant={isActive("/messages") ? "default" : "ghost"} // Asumsi halaman messages adalah /messages
          className={`w-full justify-start ${isActive("/messages") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
        >
          <Link href="/messages">
            <MessageCircle className="w-5 h-5 mr-3" />
            Message
          </Link>
        </Button> */}

        {/* Admin Only Menu - Conditional Rendering berdasarkan peran admin */}
        {isAdmin && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2 px-3">ADMIN PANEL</p>
            
            {/* Manage Events */}
            <Button
              asChild
              variant={isActive("/main/manage-event") ? "default" : "ghost"} // Asumsi halaman manage events adalah /main/events
              className={`w-full justify-start ${isActive("/main/manage-event") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
            >
              <Link href="/main/manage-event">
                <Shield className="w-5 h-5 mr-3" />
                Manage Events
              </Link>
            </Button>

            {/* Manage Users */}
            <Button
              asChild
              variant={isActive("/main/manage-user") ? "default" : "ghost"} // Asumsi halaman manage users adalah /main/users
              className={`w-full justify-start ${isActive("/main/manage-user") ? "bg-primary hover:bg-orange-600 text-white" : "text-primary hover:text-orange-600 hover:bg-orange-50"}`}
            >
              <Link href="/main/manage-user">
                <Users className="w-5 h-5 mr-3" />
                Manage Users
              </Link>
            </Button>
          </div>
        )}
      </nav>
    </aside>
  );
}