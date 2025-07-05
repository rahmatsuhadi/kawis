"use client"

import { LogIn, MapPin, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import Image from "next/image"
import getInitialName from "@/lib/getInitialName"
import {  useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useGeolocation } from "@/context/geolocation-context"
import { useRouter } from "next/navigation"
import LocationModal from "../interaktif-maps/location-modal"
import { Button } from "../ui/button"

export default function Header() {
  const { data: session, status, } = useSession()
  
  
  const { address, setRadius, radius } = useGeolocation()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const router = useRouter()
  const handleLocationClick = () => {
    setIsLocationModalOpen(true)
  }



  const handleAuthClick = () => {
    if (session) {
      // Jika sudah login, ke halaman profile
      router.push("/main/profile")
    } else {
      // Jika belum login, ke halaman login
      router.push("/login")
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src={"/brand.svg"} alt="logo" width={50} height={50} />
            <span className="font-semibold hidden md:flex text-gray-800 text-sm lg:text-base">Kawis Kita</span>

          </div>

           {/* Mobile Location Button */}
          <div className="md:hidden">
            <button
              onClick={handleLocationClick}
              className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-orange-600 truncate max-w-[100px]">
                {address ? address.split(",")[0] : "Set Lokasi"}
              </span>
            </button>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="flex-1 max-w-2xl mx-3">
            <div className="flex gap-4 flex-row">
              {/* Location Display - Clickable */}
              <div
                className="hidden md:flex  rounded-l-2xl px-3 py-2 border border-black/20  items-center cursor-pointer hover:bg-orange-50 transition-colors"
                onClick={handleLocationClick}
                title="Klik untuk mengubah lokasi"
              >
                <h5 className="text-primary truncate text-sm max-w-[300px]">{address || "Klik untuk set lokasi"}</h5>
              </div>

              {/* Radius Selector */}
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger
                  className="  md:w-[100px] h-full border border-black/20 rounded-none text-primary"
                  style={{ height: 42 }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 KM</SelectItem>
                  <SelectItem value="5">5 KM</SelectItem>
                  <SelectItem value="10">10 KM</SelectItem>
                  <SelectItem value="20">20 KM</SelectItem>
                  <SelectItem value="50">50 KM</SelectItem>
                </SelectContent>
              </Select>

              {/* Map Icon - Also clickable */}
              <div
                className="hidden md:flex  rounded-r-2xl py-2 px-4 border  items-center border-black/20 cursor-pointer hover:bg-orange-50 transition-colors"
                onClick={handleLocationClick}
                title="Klik untuk mengubah lokasi"
              >
                <MapPin className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

         

          {/* User Profile / Login Button */}
          {status === "loading" ? (
            // Loading state
            <div className="flex items-center space-x-2 p-2">
              <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="hidden sm:flex flex-col space-y-1">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          ) : session ? (
            // Logged in - Show user profile
            <div
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={handleAuthClick}
            >
              <Avatar className="w-8 lg:w-10 h-8 lg:h-10">
                <AvatarImage src={session.user.image || '/placeholder.jpg'}/>
                <AvatarFallback>{getInitialName(session.user.name as string)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col">
                <span className="font-medium text-sm lg:text-base">{session.user.name}</span>
                {session.user.role === "ADMIN" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            // Not logged in - Show login button
            <div className="flex items-center space-x-2">
              {/* Mobile Login Button */}
              <Button
                onClick={handleAuthClick}
                size="sm"
                className="sm:hidden bg-orange-500 hover:bg-orange-600 text-white px-3 py-2"
              >
                <LogIn className="w-4 h-4" />
              </Button>

              {/* Desktop Login Button */}
              <Button
                onClick={handleAuthClick}
                size="sm"
                className="hidden sm:flex bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </>
  )
}
