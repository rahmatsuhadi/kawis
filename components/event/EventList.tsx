"use client"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"
import { IEvent } from "@/types"
import { toast } from "sonner"
import { Event, EventImage } from "@prisma/client"
import { useRouter } from "next/navigation"


export async function fetchEvents(): Promise<EventsApiResponse> {
  // const [_key, currentStatus, pageNum, limit] = queryKey;
  // const offset = (Number(pageNum) - 1) * Number(limit);

  // Perbaiki URL untuk menyertakan query parameters
  const url = `/api/events`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal memuat event.");
  }
  const data: EventsApiResponse = await response.json(); // Cast data ke tipe yang benar
  return data;
}

export interface EventResponse extends Event {
  images: EventImage[]
}


export interface EventsApiResponse {
  events: EventResponse[]; // Array event sesuai tipe Event di atas
  total: number; // Total jumlah event
}



export default function EventList() {

  const router = useRouter()


  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EventsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
    queryKey: ["events",],
    queryFn: fetchEvents,
    refetchOnWindowFocus: true,
  });
  const events = data?.events || [];


  return (
    <aside className="hidden xl:block w-[400px] bg-white border-l border-gray-200 p-6  ">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Event Terdekat</h2>
          {isLoading ? (
            // Placeholder skeleton loader
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-gray-100"
                >
                  <div className="w-16 h-16 bg-gray-300 rounded-lg" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="w-8 h-6 bg-gray-300 rounded" />
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => router.push("/main/event/" + event.id)}
                >
                  <div className="w-[50px] h-[50px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={event.images[0]?.imageUrl || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {String(event.name).length > 50 ? String(event.name).substring(0, 50) + "..." : event.name}
                    </h3>
                    <p className="text-xs text-gray-500">{new Date(event.startDate).toDateString()}</p>
                  </div>
                  <div className="h-full flex">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 mt-2  p-2">
                    <Calendar className="w-3 h-3" />
                  </Badge>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Placeholder saat data kosong
            <p className="text-sm text-gray-500">Tidak ada event terdekat.</p>
          )}
          <Button variant="link" className="text-orange-500 p-0 mt-4">
            Lihat Semua List
          </Button>
        </div>
      </div>
    </aside>
  )
}