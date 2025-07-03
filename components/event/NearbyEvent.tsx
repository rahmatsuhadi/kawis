"use client"

import { Calendar, MapPin, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { EventResponse } from "./EventList"

interface NearbyEventsCardProps {
  events: EventResponse[]
  maxEvents?: number
  title?: string
  showViewAll?: boolean
  onViewAll?: () => void
  isLoading: boolean
}

export default function NearbyEventsCard({
  events,
  maxEvents = 1,
  title = "Event Terdekat",
  showViewAll = true,
  isLoading,
  onViewAll,
}: NearbyEventsCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
    return date.toLocaleDateString("ID-id", options)
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

  const displayEvents = events.slice(0, maxEvents)

  const handleEventClick = (event: EventResponse) => {
    router.push(`/main/event/${event.id}`)
  }

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll()
    } else {
      router.push("/main/explore")
    }
  }

  return (
    <Card className="w-full bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {displayEvents.length > 0 ? (
          <>
            {/* Event List */}
            <div className="space-y-3">
              {displayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                  onClick={() => handleEventClick(event)}
                >
                  {/* Event Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                      <Image
                        src={event.images[0]?.imageUrl || "/placeholder.svg?height=48&width=48"}
                        alt={event.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {truncateText(event.name, 25)}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <span>{formatDate(new Date(event.startDate))}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                      <MapPin className="w-3 h-3 text-green-500" />
                      <span className="truncate max-w-[120px]">{formatDistance(event.distanceKm)}</span>
                    </div>
                  </div>

                  {/* Action Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                      <Calendar className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            {showViewAll && events.length > maxEvents && (
              <div className="pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAll}
                  className="w-full text-orange-500 hover:text-orange-600 hover:bg-orange-50 justify-between"
                >
                  <span className="font-medium">Lihat Semua List</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Event Count Info */}
            {events.length > 0 && (
              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  {displayEvents.length} dari {events.length} event terdekat
                </span>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="flex items-center justify-center flex-col">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 justify-center mb-2">
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              <span className="text-sm">Memuat Event...</span>
            </div>
          </div>
          
        ) : (
          /* Empty State */
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Tidak ada event terdekat</h4>
            <p className="text-xs text-gray-500">Coba perluas radius pencarian Anda</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
