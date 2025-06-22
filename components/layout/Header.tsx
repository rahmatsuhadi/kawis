"use client"

import { MapPin, Shield } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import Image from "next/image"
import getInitialName from "@/lib/getInitialName"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useGeolocation } from "@/context/geolocation-context"
import { useRouter } from "next/navigation"
import LocationModal from "../interaktif-maps/location-modal"

export default function Header() {
  const { data } = useSession()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)


  const { address, setRadius, radius } = useGeolocation()
  const router = useRouter()
  const handleLocationClick = () => {
    setIsLocationModalOpen(true)
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
              <MapPin className="w-4 h-4 text-orange-500" />
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
                className="shadow-xl hidden md:flex  rounded-l-2xl px-3 py-2 border border-black/20  items-center cursor-pointer hover:bg-orange-50 transition-colors"
                onClick={handleLocationClick}
                title="Klik untuk mengubah lokasi"
              >
                <h4 className="text-orange-500 truncate max-w-[250px]">{address || "Klik untuk set lokasi"}</h4>
              </div>

              {/* Radius Selector */}
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger
                  className="  md:w-[100px] h-full border shadow-xl border-black/20 rounded-none text-orange-500"
                  style={{ height: "100%" }}
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
                className="shadow-xl hidden md:flex  rounded-r-2xl py-2 px-4 border  items-center border-black/20 cursor-pointer hover:bg-orange-50 transition-colors"
                onClick={handleLocationClick}
                title="Klik untuk mengubah lokasi"
              >
                <MapPin className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>

         

          {/* User Profile */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() => router.push("/main/profile")}
          >
            <Avatar className="w-8 lg:w-10 h-8 lg:h-10">
              {/* <AvatarImage src="/placeholder.jpg?height=40&width=40" /> */}
              <AvatarFallback>{getInitialName(data?.user.name as string)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col">
              <span className="font-medium text-sm lg:text-base">{data?.user.name}</span>
              {data?.user.role == "ADMIN" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </>
  )
}
