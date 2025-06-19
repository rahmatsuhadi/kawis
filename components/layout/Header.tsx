"use client"

import { MapPin, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import Image from "next/image";
import getInitialName from "@/lib/getInitialName";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGeolocation } from "@/context/geolocation-context";
import { useRouter } from "next/navigation";

export default function Header() {

  const { data } = useSession();

  const [currentRadius, setCurrentRadius] = useState("5");

  const {location} = useGeolocation()

  const router = useRouter()

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 w-full ">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          {/* <div className="w-6 lg:w-8 h-6 lg:h-8 bg-black flex items-center justify-center">
            <span className="text-white font-bold text-xs">KK</span>
          </div> */}
          <Image src={"/brand.svg"} alt="logo" width={50} height={50} />
          <span className="font-semibold text-gray-800 text-sm lg:text-base">Kawis Kita</span>
          <span className="font-semibold text-gray-800 text-sm lg:text-base">{location.latitude} - {location.longitude}</span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">

          <div className="flex gap-4 flex-row">
            <div className="shadow-xl rounded-l-2xl px-3   py-2 border border-black/20 flex items-center ">
              <h4 className="text-orange-500   ">{location?.address || "Lokasi tidak tersedia"}</h4>
            </div>

            {/* <div className="h-full"> */}
              <Select value={currentRadius} onValueChange={setCurrentRadius}>
                <SelectTrigger className="  w-[100px] h-full border shadow-xl  border-black/20 rounded-none  text-orange-500" style={{height: "100%"}}>
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
            {/* </div> */}

            <div className="shadow-xl rounded-r-2xl py-2 px-4 border flex items-center border-black/20 ">
              <MapPin className="w-4 h-4 text-orange-500" />
            </div>
          </div>

          {/* <div className="relative w-full">

            <div className="pl-4 pr-20 py-2 rounded-sm bg-orange-50 border-orange-200">
              <h4 className="">Amikom University, Gedung Gasal Semeru Yogyakarta</h4>
            </div>


            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              
              <Select value={currentRadius} onValueChange={setCurrentRadius}>
                <SelectTrigger className=" text-xs font-bold  bg-orange-100 text-orange-700">
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
              <MapPin className="w-4 h-4 text-orange-500" />
            </div>
          </div> */}
        </div>

        {/* User Profile */}
        <div
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"

        >
          <Avatar className="w-8 lg:w-10 h-8 lg:h-10" onClick={() => router.push("/main/profile")}>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
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

  )
}