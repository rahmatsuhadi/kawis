"use client"
import { QueryFunctionContext, useQuery } from "@tanstack/react-query"
import { Category, Event } from "@prisma/client"
import { useGeolocation } from "@/context/geolocation-context"
import NearbyEventsCard from "./NearbyEvent"


export async function fetchEvents(context: QueryFunctionContext): Promise<EventsApiResponse> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_key, lat, lng, radius] = context.queryKey as [string, number?, number?, number?]

  // Perbaiki URL untuk menyertakan query parameters
  let url = `/api/events/nearby`;

  url += `?lat=${lat}&lng=${lng}&sort=distance`;

  // Radius opsional
  if (!!radius) {
    url += `&radius=${radius}&`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal memuat event.");
  }
  const data: EventsApiResponse = await response.json(); // Cast data ke tipe yang benar
  return data;
}

export interface EventResponse extends Event {
  images: string[]
  categories: Category[]
  distanceKm: number
}


export interface EventsApiResponse {
  events: EventResponse[]; // Array event sesuai tipe Event di atas
  total: number; // Total jumlah event
}



export default function EventList() {


  const { location, radius } = useGeolocation()


  const {
    data,
    isLoading,
  } = useQuery<EventsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
    // queryKey: ["events",],
    enabled: !!location,
    queryKey: ["events-nearby", location?.latitude, location?.longitude, radius],
    queryFn: fetchEvents,
    refetchOnWindowFocus: true,
  });
  const events = data?.events || [];

  return (
    <aside className="hidden xl:block w-[450px] bg-white border-l border-gray-200 p-6  ">
      <NearbyEventsCard
        maxEvents={3}
        events={events}
        isLoading={isLoading || !data}
        title="Event Terdekat"
        showViewAll={true}
        onViewAll={() => console.log("View all clicked")}
      />
    </aside>
  )
}