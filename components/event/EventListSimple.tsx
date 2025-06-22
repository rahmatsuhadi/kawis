"use client"

import { Calendar, MapPin, Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { EventResponse } from "./EventList"


interface EventListSimpleProps {
  events: EventResponse[]
  layout?: "vertical" | "horizontal"
  showDistance?: boolean
  showOrganizer?: boolean
  compact?: boolean
}

export default function EventListSimple({
  events,
  layout = "vertical",
  showDistance = true,
  showOrganizer = false,
  compact = false,
}: EventListSimpleProps) {
  const router = useRouter()

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)} km`
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const getEventStatus = (startDate: string | Date, endDate: string | Date) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return { status: "upcoming", label: "Akan Datang", color: "bg-blue-100 text-blue-700" }
    if (now >= start && now <= end)
      return { status: "ongoing", label: "Berlangsung", color: "bg-green-100 text-green-700" }
    return { status: "ended", label: "Berakhir", color: "bg-gray-100 text-gray-700" }
  }

  const handleEventClick = (event: EventResponse) => {
    router.push(`/main/event/${event.id}`)
  }



  if (layout === "horizontal") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {events.map((event) => {
          const eventStatus = getEventStatus(event.startDate, event.endDate)
          return (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] overflow-hidden"
              onClick={() => handleEventClick(event)}
            >
              {/* Event Image */}
              <div className="relative h-32">
                <Image
                  src={event.images[0]?.imageUrl || "/placeholder.svg?height=128&width=200"}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={`text-xs ${eventStatus.color}`}>{eventStatus.label}</Badge>
                </div>
                {showDistance && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white text-xs">{formatDistance(event.distanceKm)}</Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-3">
                <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2">
                  {truncateText(event.name, 40)}
                </h3>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar className="w-3 h-3 text-orange-500" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>{formatTime(event.startDate)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 text-green-500" />
                    <span className="truncate">{truncateText(event.address, 25)}</span>
                  </div>

                  {showOrganizer && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="w-3 h-3 text-purple-500" />
                      <span className="truncate">{event.organizerName || event.anonymousName || "Organizer"}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const eventStatus = getEventStatus(event.startDate, event.endDate)
        return (
          <Card
            key={event.id}
            className="cursor-pointer hover:shadow-sm transition-all duration-200 hover:scale-[1.01] border-l-4 border-l-orange-500"
            onClick={() => handleEventClick(event)}
          >
            <CardContent className={`${compact ? "p-3" : "p-4"}`}>
              <div className="flex items-center space-x-3">
                {/* Event Image */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`${compact ? "w-12 h-12" : "w-16 h-16"} rounded-lg overflow-hidden bg-gray-100 shadow-sm`}
                  >
                    <Image
                      src={event.images[0]?.imageUrl || "/placeholder.svg?height=64&width=64"}
                      alt={event.name}
                      width={compact ? 48 : 64}
                      height={compact ? 48 : 64}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  {showDistance && (
                    <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                      {formatDistance(event.distanceKm)}
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3
                      className={`font-semibold ${compact ? "text-sm" : "text-base"} text-gray-800 line-clamp-1 pr-2`}
                    >
                      {truncateText(event.name, compact ? 30 : 40)}
                    </h3>
                    <Badge className={`text-xs ${eventStatus.color} flex-shrink-0`}>{eventStatus.label}</Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3 text-orange-500" />
                      <span>{formatDate(event.startDate)}</span>
                      <span className="text-gray-400">•</span>
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{formatTime(event.startDate)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 text-green-500" />
                      <span className="truncate">{truncateText(event.address, compact ? 25 : 35)}</span>
                    </div>

                    {showOrganizer && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3 text-purple-500" />
                        <span className="truncate">by {event.organizerName || event.anonymousName || "Organizer"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Indicator */}
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-orange-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Empty State */}
      {events.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Tidak ada event ditemukan</h3>
            <p className="text-sm text-gray-500">Coba perluas radius pencarian atau ubah filter Anda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
