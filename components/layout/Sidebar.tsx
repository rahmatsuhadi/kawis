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
   <aside className="hidden lg:block max-w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto shadow-lg transition-all duration-300 ease-in-out">
      <nav className="p-4 space-y-2">
        {/* Home */}
        <Button
          asChild // Render sebagai children, bukan button HTML
          variant={isActive("/main") ? "default" : "ghost"} // Highlight jika aktif
          className={`
            w-full justify-start rounded-lg px-4 py-2 transition-all duration-200 ease-in-out
            ${isActive("/main")
              ? "bg-primary text-white shadow-md transform scale-[1.02] hover:bg-primary-dark" // bg-primary dan hover yang lebih gelap
              : "text-primary hover:text-primary-dark hover:bg-primary-50 active:bg-primary-100" // text-primary dan hover/active yang lebih terang
            }
          `}
        >
          <Link href="/main" className="flex items-center w-full h-full"> {/* Pastikan Link meliputi seluruh area tombol */}
            <Home className="w-5 h-5 mr-3 shrink-0" />
            <span className="truncate">Home</span>
          </Link>
        </Button>

        {/* Interaktif Maps */}
        <Button
          asChild
          variant={isActive("/main/maps") ? "default" : "ghost"}
          className={`
            w-full justify-start rounded-lg px-4 py-2 transition-all duration-200 ease-in-out
            ${isActive("/main/maps")
              ? "bg-primary text-white shadow-md transform scale-[1.02] hover:bg-primary-dark"
              : "text-primary hover:text-primary-dark hover:bg-primary-50 active:bg-primary-100"
            }
          `}
        >
          <Link href="/main/maps" className="flex items-center w-full h-full">
            <MapPin className="w-5 h-5 mr-3 shrink-0" />
            <span className="truncate">Interactive Maps</span>
          </Link>
        </Button>

        {/* Explore */}
        <Button
          asChild
          variant={isActive("/main/explore") ? "default" : "ghost"}
          className={`
            w-full justify-start rounded-lg px-4 py-2 transition-all duration-200 ease-in-out
            ${isActive("/main/explore")
              ? "bg-primary text-white shadow-md transform scale-[1.02] hover:bg-primary-dark"
              : "text-primary hover:text-primary-dark hover:bg-primary-50 active:bg-primary-100"
            }
          `}
        >
          <Link href="/main/explore" className="flex items-center w-full h-full">
            <Search className="w-5 h-5 mr-3 shrink-0" />
            <span className="truncate">Explore</span>
          </Link>
        </Button>

        {/* Post Event - Hanya terlihat jika ada sesi */}
        {session && (
          <Button
            asChild
            variant={isActive("/main/event-create") ? "default" : "ghost"}
            className={`
              w-full justify-start rounded-lg px-4 py-2 transition-all duration-200 ease-in-out
              ${isActive("/main/event-create")
                ? "bg-primary text-white shadow-md transform scale-[1.02] hover:bg-primary-dark"
                : "text-primary hover:text-primary-dark hover:bg-primary-50 active:bg-primary-100"
              }
            `}
          >
            <Link href="/main/event-create" className="flex items-center w-full h-full">
              <Calendar className="w-5 h-5 mr-3 shrink-0" />
              <span className="truncate">Post Event</span>
            </Link>
          </Button>
        )}

        {/* Admin Only Menu */}
        {isAdmin && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2 px-3 uppercase tracking-wider">ADMIN PANEL</p> 
            
            {/* Manage Events */}
            <Button
              asChild
              variant={isActive("/main/manage-event") ? "default" : "ghost"}
              className={`
                w-full justify-start rounded-lg px-4 py-2 transition-all duration-200 ease-in-out
                ${isActive("/main/manage-event")
                  ? "bg-primary text-white shadow-md transform scale-[1.02] hover:bg-primary-dark"
                  : "text-primary hover:text-primary-dark hover:bg-primary-50 active:bg-primary-100"
                }
              `}
            >
              <Link href="/main/manage-event" className="flex items-center w-full h-full">
                <Shield className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Manage Events</span>
              </Link>
            </Button>

            {/* Manage Users */}
            <Button
              asChild
              variant={isActive("/main/manage-user") ? "default" : "ghost"}
              className={`
                w-full justify-start rounded-lg px-4 py-2 transition-all duration-200 ease-in-out
                ${isActive("/main/manage-user")
                  ? "bg-primary text-white shadow-md transform scale-[1.02] hover:bg-primary-dark"
                  : "text-primary hover:text-primary-dark hover:bg-primary-50 active:bg-primary-100"
                }
              `}
            >
              <Link href="/main/manage-user" className="flex items-center w-full h-full">
                <Users className="w-5 h-5 mr-3 shrink-0" />
                <span className="truncate">Manage Users</span>
              </Link>
            </Button>
          </div>
        )}
      </nav>
    </aside>
  );
}