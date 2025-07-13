"use client"

import { useMemo, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { MapPin, Calendar, Users, Heart, Share2, Filter, Search,} from "lucide-react"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { QueryFunctionContext, useQuery } from "@tanstack/react-query"
import { Category } from "@prisma/client"
import { useGeolocation } from "@/context/geolocation-context"
import { IEvent } from "@/lib/type"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventCardExplore, EventListItemSkeletonExplore } from "@/components/event/CardEvent"
// import { EventListItemSkeletonExplore } from "@/components/event/Card"
// import { IEvent } from "@/lib/type"


interface EventsApiResponse {
    events: IEvent[];
    total: number;
}

export async function fetchEvents({ queryKey }: QueryFunctionContext): Promise<EventsApiResponse> {

    const [
        _key // eslint-disable-line @typescript-eslint/no-unused-vars
        ,
        lat,           // User's latitude
        lng,           // User's longitude
        radius,        // Search radius
        selectedCategoryIds, // Selected category IDs (comma-separated string)
        searchTerm,    // Search query text
        activeFilter,  // Active filter like 'free', 'paid', 'trending', 'upcoming' etc.
    ] = queryKey as [string, number | undefined, number | undefined, number | undefined, string | undefined, string | undefined, string | undefined];

    let url = `/api/events?limit=10&offset=0`; // Default limit/offset for explore page

    // Add location parameters (lat, lng are required by your API)
    if (lat !== undefined && lng !== undefined) {
        url += `&lat=${lat}&lng=${lng}`;
    }
    if (radius !== undefined) {
        url += `&radius=${radius}`;
    }

    // Add categories filter
    if (selectedCategoryIds && selectedCategoryIds !== "all") {
        url += `&categories=${selectedCategoryIds}`;
    }

    // Add search term filter
    if (searchTerm) {
        url += `&q=${searchTerm}`; // Assuming your API uses 'q' for search query
    }

    // Add main filter options
    if (activeFilter) {
        switch (activeFilter) {
            case "free":
                url += `&priceFilter=free`; // Assuming API has priceFilter=free
                break;
            case "paid":
                url += `&priceFilter=paid`; // Assuming API has priceFilter=paid
                break;
            case "upcoming": // Your API already defaults to upcoming/ongoing. If you want only 'upcoming', adjust API or add param.
                url += `&period=upcoming`; // Assuming your API can filter by 'period' parameter
                break;
            case "ongoing":
                url += `&period=ongoing`; // Assuming your API can filter by 'period' parameter
                break;
            case "nearby": // This is handled by lat/lng/radius. No extra param needed.
                break;
            // 'all' doesn't need extra param
        }
    }

    //   console.log("Fetching events for ExplorePage from:", url); // For debugging

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load events.");
    }
    const data: EventsApiResponse = await response.json();
    return data;
}

export default function ExplorePage() {

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'nearby', 'upcoming', 'free', 'paid'
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); // Stores ID of selected category

    const { location: userLocation, radius: userRadius } = useGeolocation()


    //   // Fetch categories for the filter buttons
    const { data: categoriesData} = useQuery<Category[], Error>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to load categories.");
            }
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // Cache categories for 5 minutes
    });
    const availableCategories = categoriesData || [];



    // Fetch events based on all filters and user's location
    const {
        data: eventsData,
        isLoading: isLoadingEvents,
    } = useQuery<EventsApiResponse, Error>({
        // queryKey depends on all filters and user's location
        queryKey: [
            "exploreEvents",
            userLocation?.latitude,
            userLocation?.longitude,
            userRadius ? parseFloat(userRadius) : undefined, // Radius is optional in API
            selectedCategoryId, // Category ID filter
            searchQuery, // Search query text
            activeFilter, // General filter (free, paid, trending, etc.)
        ],
        queryFn: fetchEvents, // Your fetchEvents function
        // Only enable query if user location is available and permission granted
        enabled: !!userLocation,
        staleTime: 1000 * 60, // Data stale after 1 minute
        refetchOnWindowFocus: true,
    });

    const events = useMemo(() => eventsData?.events || [], [eventsData]);


    // if (!userLocation) {
    if (!userLocation) {
        return (
            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-6xl mx-auto p-4 space-y-6">
                    <div className="text-center p-4">
                        <p className="text-gray-700 mb-2">Menunggu lokasi Anda...</p>
                        <p className="text-gray-500">Silahkan posisikan lokasi Anda untuk memulai pencarian acara.</p>
                    </div>
                </div>
            </main>
        );
    }



    return (
        <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fadeIn">Explore Events</h1>
                    <p className="text-lg text-gray-600 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                        Discover exciting events around you and join communities
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search event, location, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 text-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 shadow-lg"
                        />
                    </div>

                    {/* Filter Buttons (All, Nearby, Upcoming, Free, Paid, Trending) */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {/* "All Events" button - Resets all other filters implicitly */}
                        <Button
                            variant={activeFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setActiveFilter("all"); setSelectedCategoryId(null); setSearchQuery(""); }}
                            className={`
                                transition-all duration-200 hover:scale-105
                                ${activeFilter === "all"
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                }
                            `}
                        >
                            All Events
                        </Button>
                        {/* "Nearby" button - Relies on location parameters (already always sent) */}
                        <Button
                            variant={activeFilter === "nearby" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter("nearby")}
                            className={`
                                transition-all duration-200 hover:scale-105
                                ${activeFilter === "nearby"
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                }
                            `}
                        >
                            <MapPin className="h-4 w-4 mr-1" /> Nearby
                        </Button>
                        {/* "Upcoming" button - Relies on API's default date filter */}
                        <Button
                            variant={activeFilter === "upcoming" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter("upcoming")}
                            className={`
                                transition-all duration-200 hover:scale-105
                                ${activeFilter === "upcoming"
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                }
                            `}
                        >
                            Upcoming
                        </Button>
                        {/* "Free" button */}
                        <Button
                            variant={activeFilter === "free" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter("free")}
                            className={`
                                transition-all duration-200 hover:scale-105
                                ${activeFilter === "free"
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                }
                            `}
                        >
                            Free
                        </Button>
                        {/* "Paid" button */}
                        <Button
                            variant={activeFilter === "paid" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter("paid")}
                            className={`
                                transition-all duration-200 hover:scale-105
                                ${activeFilter === "paid"
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                }
                            `}
                        >
                            Paid
                        </Button>
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <Button
                            variant={selectedCategoryId === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategoryId(null)}
                            className={`
                                transition-all duration-200 hover:scale-105
                                ${selectedCategoryId === null
                                    ? "bg-gray-800 hover:bg-gray-900 text-white"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                                }
                            `}
                        >
                            All Categories
                        </Button>
                        {availableCategories.map((category) => (
                            <Button
                                key={category.id}
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCategoryId(category.id)}
                                className={`
                                    
                                transition-all duration-200 hover:scale-105
                                ${selectedCategoryId === category.id
                                        ? "bg-gray-800 hover:bg-gray-900 hover:text-white/50 text-white"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"}
                                `}
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>



                </div>

                {/* Results Count and Sort Dropdown */}
                {/* <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                        Displaying <span className="font-semibold text-orange-600">{events.length}</span> events
                    </p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Latest</DropdownMenuItem>
                            <DropdownMenuItem>Closest</DropdownMenuItem>
                            <DropdownMenuItem>Most Popular</DropdownMenuItem>
                            <DropdownMenuItem>Lowest Price</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div> */}

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render skeleton or empty state if no events */}

                    {isLoadingEvents ?
                        Array.from({ length: 6 }).map((_, i) => <EventListItemSkeletonExplore key={i} />)

                        : events.length === 0 ? (
                            <div className="text-center py-4 col-span-full">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-12 w-12 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your filters or search query.</p>
                                <Button
                                    onClick={() => { setSearchQuery(""); setActiveFilter("all"); setSelectedCategoryId(null); }}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            // Map and render actual EventCards
                            events.map((event, index) => (
                                <EventCardExplore idx={index} key={event.id} event={event} /> // Use EventCard component
                            ))
                        )}

                </div>

            </div>
        </main>
    )

}

