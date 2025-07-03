"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, MapPin } from "lucide-react"
import EventListSimple from "@/components/event/EventListSimple"
import { useGeolocation } from "@/context/geolocation-context"
import { useQuery } from "@tanstack/react-query"
import { EventsApiResponse, fetchEvents } from "./EventList"






export default function ExploreEvent() {
    const [viewMode, setViewMode] = useState<"vertical" | "horizontal">("vertical")



    const { location, radius } = useGeolocation()

    const currentRadius = radius;
    const {
        data,
        isPending: isLoading,
    } = useQuery<EventsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
        // queryKey: ["events",],
        enabled: !!location,
        queryKey: ["events-nearby", location?.latitude, location?.longitude],
        queryFn: fetchEvents,
        refetchOnWindowFocus: true,
    });


    const allEvents =useMemo(() =>  data?.events || [],[data])

    // Filter event untuk tab "Terdekat"
    const nearbyEvents = useMemo(() => {
        // filter events where distanceKm is not null AND distanceKm is within userRadius
        // If userRadius is not set, this filter might not apply, or you can use a default small radius here.
        const radiusValue = currentRadius ? parseFloat(currentRadius) : 5; // Default 5 KM if context radius is null
        return allEvents.filter(event =>
            event.distanceKm !== null && event.distanceKm <= radiusValue
        ).sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity)); // Urutkan berdasarkan jarak
    }, [allEvents, currentRadius]);

    // Filter event untuk tab "Mendatang"
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        // Filter event yang tanggal mulainya di masa depan
        return allEvents.filter(event => new Date(event.startDate) > now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()); // Urutkan berdasarkan tanggal terdekat
    }, [allEvents]);


    return (
        <div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            Semua Event
                        </CardTitle>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === "vertical" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("vertical")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "horizontal" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("horizontal")}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">Semua</TabsTrigger>
                            <TabsTrigger value="nearby">Terdekat</TabsTrigger>
                            <TabsTrigger value="upcoming">Mendatang</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-4">
                            <EventListSimple
                            isLoading={isLoading}
                                events={allEvents}
                                layout={viewMode}
                                showDistance={true}
                                showOrganizer={true}
                                compact={false}
                            />
                        </TabsContent>

                        <TabsContent value="nearby" className="mt-4">
                            <EventListSimple
                            isLoading={isLoading}
                                events={nearbyEvents}
                                layout={viewMode}
                                showDistance={true}
                                showOrganizer={false}
                                compact={false}
                            />
                        </TabsContent>

                        <TabsContent value="upcoming" className="mt-4">
                            <EventListSimple
                            isLoading={isLoading}
                                events={upcomingEvents}
                                layout={viewMode}
                                showDistance={true}
                                showOrganizer={true}
                                compact={false}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
        </div>
    )
}