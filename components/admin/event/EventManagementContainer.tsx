"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Eye, Check, X, Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import StaticCard from "@/components/admin/event/StaticCard"
import { QueryFunctionContext, useMutation,  useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDate, formatTime } from "@/lib/formater"
import { EventStatus } from "@prisma/client"
import { toast } from "sonner"
import { IEvent } from "@/lib/type"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { formatRupiah } from "@/lib/format-rupiah"
import getInitialName from "@/lib/getInitialName"
import RadarMaps from "@/components/event/RadarMap"

const getStatusBadge = (status: EventStatus) => {
    switch (status) {
        case "APPROVED":
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
        case "REJECTED":
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>
        case "PENDING":
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
        default:
            return <Badge variant="secondary">Unknown</Badge>
    }
}


interface EventsApiResponse {
    events: IEvent[];
    total: number;
}



async function fetchEvents(context: QueryFunctionContext): Promise<EventsApiResponse> {
    // The queryKey will now include pagination parameters
    // queryKey example: ["events", { statusFilter: "all", page: 1, limit: 10 }]

    const [
        _key // eslint-disable-line @typescript-eslint/no-unused-vars
        , 
        filters] = context.queryKey as [string, {
        statusFilter?: string; // 'all', 'pending', 'approved', 'rejected'
        page?: number;
        limit?: number;
        lat?: number;
        lng?: number;
        radius?: number;
        categories?: string;
        q?: string;
        priceFilter?: string;
        isTrending?: boolean;
    }];

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let url = `/api/events?limit=${limit}&offset=${offset}`;

    // Add status filter if not 'all'
    if (filters.statusFilter && filters.statusFilter !== "all") {
        url += `&status=${filters.statusFilter}`;
    }

    // Add location parameters (lat, lng are required by your API now)
    if (filters.lat !== undefined && filters.lng !== undefined) {
        url += `&lat=${filters.lat}&lng=${filters.lng}`;
    }
    if (filters.radius !== undefined) {
        url += `&radius=${filters.radius}`;
    }

    // Add categories filter
    if (filters.categories && filters.categories !== "all") {
        url += `&categories=${filters.categories}`;
    }

    // Add search term filter
    if (filters.q) {
        url += `&q=${filters.q}`;
    }

    // Add main filter options (price, trending)
    if (filters.priceFilter) {
        url += `&priceFilter=${filters.priceFilter}`;
    }
    if (filters.isTrending) {
        url += `&isTrending=true`;
    }

    console.log(`Fetching events for admin table from: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load events.");
    }
    const data: EventsApiResponse = await response.json();
    return data;
}


export default function EventManagementContainer() {
    const queryClient = useQueryClient();

    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(5); // Items per page

    // State for tracking ongoing mutation process to disable specific buttons
    const [actionProcess, setActionProcess] = useState<{ action: "APPROVED" | "REJECTED", id: string } | null>(null);

    const {
        data,
        isLoading, // Initial loading for the table
    } = useQuery<EventsApiResponse, Error>({
        queryKey: [
            "adminEvents",
            { statusFilter: filterStatus, page: currentPage, limit: eventsPerPage }
        ],
        queryFn: fetchEvents,
        refetchOnWindowFocus: true,
    });

    const events = useMemo(() => data?.events || [], [data?.events]);
    const totalEvents = data?.total || 0;
    const totalPages = Math.ceil(totalEvents / eventsPerPage);

    const filteredEvents = useMemo(() => {
        if (filterStatus === "all") {
            return events;
        }
        return events.filter((event) => event.status === filterStatus);
    }, [events, filterStatus]);


    // Mutation for updating event status
    const updateEventStatusMutation = useMutation({
        mutationFn: async ({ eventId, newStatus }: { eventId: string; newStatus: "APPROVED" | "REJECTED" }) => {
            const response = await fetch(`/api/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update event status.");
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success("Event status updated!", { duration: 2000 });
            setActionProcess(null); // Clear action process on success
            queryClient.invalidateQueries({ queryKey: ["adminEvents"] }); // Invalidate admin list to refetch
            queryClient.invalidateQueries({ queryKey: ["events"] }); // Invalidate public list too
        },
        onError: (error) => {
            setActionProcess(null); // Clear action process on error
            toast.error("Failed to update status", { description: error.message || "An unknown error occurred." });
        },
    });

    const handleStatusChange = (eventId: string, newStatus: "APPROVED" | "REJECTED") => {
        setActionProcess({ action: newStatus, id: eventId }); // Set action process for specific event
        updateEventStatusMutation.mutate({ eventId, newStatus: newStatus });
    };



    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Event Management</h1>
                <div className="flex items-center gap-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Statistics Cards */}
            <StaticCard
                approved={events.filter(item => item.status == "APPROVED").length}
                pending={events.filter(item => item.status == "PENDING").length}
                rejected={events.filter(item => item.status == "REJECTED").length}
                total={data?.total || 0}
            />

            {/* Events Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-orange-500 hover:bg-orange-500">
                                <TableHead className="text-white font-semibold">#</TableHead>
                                <TableHead className="text-white font-semibold">Event Name</TableHead>
                                <TableHead className="text-white font-semibold">Duration</TableHead>
                                <TableHead className="text-white font-semibold">Created By</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                <TableHead className="text-white font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading || updateEventStatusMutation.isPending && !actionProcess ? ( // Condition for global table loading
                                // --- Loading Skeleton Rows for initial load ---
                                Array.from({ length: eventsPerPage }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell className="font-medium"><div className="h-4 bg-gray-200 rounded w-4" /></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded w-3/4" /></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded w-1/2" /></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded w-2/3" /></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded w-1/3" /></TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-8 bg-gray-200 rounded-md" />
                                                <div className="h-8 w-8 bg-gray-200 rounded-md" />
                                                <div className="h-8 w-8 bg-gray-200 rounded-md" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredEvents.length === 0 ? (
                                // --- No Events Found Message ---
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                        No events found for this filter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // --- Actual Event Rows ---
                                filteredEvents.map((event, index) => {
                                    const isSpecificActionPending = updateEventStatusMutation.isPending && actionProcess?.id === event.id;
                                    const isApproving = isSpecificActionPending && actionProcess?.action === "APPROVED";
                                    const isRejecting = isSpecificActionPending && actionProcess?.action === "REJECTED";
                                    // const isRevoking = isSpecificActionPending && actionProcess?.action === "REJECTED"; // Revoke is essentially setting to REJECTED

                                    return (
                                        <TableRow key={event.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{(currentPage - 1) * eventsPerPage + index + 1}</TableCell>
                                            <TableCell className="truncate max-w-[150px]">{event.name}</TableCell>
                                            <TableCell>{formatDate(event.startDate) + " - " + formatDate(event.endDate)}</TableCell>
                                            <TableCell>{event.anonymousName}</TableCell>
                                            <TableCell>{getStatusBadge(event.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <EventDetailDialog
                                                        event={event}
                                                        updateEventStatusMutation={updateEventStatusMutation}
                                                        actionProcess={actionProcess}
                                                        isSpecificActionPending={isSpecificActionPending}
                                                    />
                                                    {event.status === "PENDING" && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusChange(event.id, "APPROVED")}
                                                                className="bg-green-500 hover:bg-green-600 h-8 px-2"
                                                                disabled={isSpecificActionPending} // Disable button if any action for this row is pending
                                                            >
                                                                {isApproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleStatusChange(event.id, "REJECTED")}
                                                                className="border-red-500 text-red-500 hover:bg-red-50 h-8 px-2"
                                                                disabled={isSpecificActionPending} // Disable button if any action for this row is pending
                                                            >
                                                                {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {/* Approve/Reject/Revoke logic for APPROVED/REJECTED events */}
                                                    {(event.status === "APPROVED" || event.status === "REJECTED") && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusChange(event.id, event.status === "APPROVED" ? "REJECTED" : "APPROVED")}
                                                            className={`${event.status === "APPROVED" ? "border-red-500 text-red-500 hover:bg-red-50" : "bg-green-500 hover:bg-green-600"}`}
                                                            disabled={isSpecificActionPending} // Disable button if any action for this row is pending
                                                        >
                                                            {isSpecificActionPending ? <Loader2 className="w-3 h-3 animate-spin" /> : (event.status === "APPROVED" ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                                                            {event.status === "APPROVED" ? "Revoke" : "Re-Approve"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading || updateEventStatusMutation.isPending}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-gray-700 text-sm">
                    Page {currentPage} of {totalPages} ({totalEvents} events)
                </span>
                <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading || updateEventStatusMutation.isPending}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}


const EventDetailDialog = ({ event, updateEventStatusMutation, actionProcess, isSpecificActionPending }: {
    event: IEvent,
    updateEventStatusMutation:any ,// eslint-disable-line @typescript-eslint/no-explicit-any
    actionProcess: { action: "APPROVED" | "REJECTED", id: string } | null,
    isSpecificActionPending: boolean
}) => {
    // Helper to get organizer/creator name
    const getCreatorName = () => {
        if (event.organizerName) return event.organizerName;
        if (event.createdBy?.name) return event.createdBy.name; // If approved by a named user
        if (event.createdBy?.username) return event.createdBy.username;
        if (event.anonymousName) return event.anonymousName;
        return "Anonymous";
    };

    // Helper to get organizer/creator image
    const getCreatorImage = () => {
        if (event.createdBy?.image) return event.createdBy.image; // If approved by a user with image
        // Fallback to a default organizer placeholder or generic if no specific image
        return "/placeholder-org.svg";
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                    <Eye className="w-4 h-4 mr-1" />
                    Detail Event
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"> {/* Increased max-width and added scroll */}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        {event.name}
                    </DialogTitle>
                    <DialogDescription>Manage event details and approval status.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4"> {/* Added padding-y */}
                    {/* Event Main Image */}
                    {event.images && event.images.length > 0 && (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                            <Image
                                src={event.images[0] || "/placeholder.jpg"}
                                alt={event.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                            />
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Event Name</label>
                            <p className="text-base font-semibold">{event.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Organizer Name</label>
                            <p className="text-base">{event.organizerName || event.anonymousName || "Anonymous"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Duration</label>
                            <p className="text-base">{formatDate(event.startDate) + " - " + formatDate(event.endDate)}</p>
                            <p className="text-xs text-gray-500">{formatTime(event.startDate) + " - " + formatTime(event.endDate)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Location</label>
                            <p className="text-base">{event.address || "Not specified"}</p>
                            <p className="text-xs text-gray-500">Lat: {event.latitude.toString()}, Lng: {event.longitude.toString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Price</label>
                            <p className="text-base font-semibold text-orange-600">{formatRupiah(event.price?.toString())}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Submitted On</label>
                            <p className="text-base">{formatDate(event.createdAt)}</p>
                        </div>
                    </div>

                    {/* Categories and Tags */}
                    {(event.categories.length > 0 || event.tags.length > 0) && (
                        <div className="space-y-2">
                            {event.categories.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Categories</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {event.categories.map((cat) => (
                                            <Badge key={cat.id} className="bg-orange-100 text-orange-700">{cat.name}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {event.tags.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Tags</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {event.tags.map((tag) => (
                                            <Badge key={tag} className="bg-gray-200 text-gray-700">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-base mt-1 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: event.description || "" }}></p>
                    </div>

                        <label className="text-sm font-medium text-gray-600">Location </label>
                    <div className="flex justify-center mb-4 mt-1">
                        {/* Map container - Berikan dimensi yang jelas agar RadarMaps mengisi penuh */}
                        <div className="w-full h-64 md:h-80 relative rounded-lg overflow-hidden shadow-md border border-gray-200"> {/* Tambah border untuk visual */}
                            {event.latitude !== null && event.longitude !== null ? ( // Pastikan koordinat ada
                                <RadarMaps
                                    currentLocation={{ longitude: Number(event.longitude), latitude: Number(event.latitude) }}
                                    eventLocation={{
                                        name: event.name || "Lokasi Acara", // Gunakan event.name
                                        latitude: Number(event.latitude),
                                        longitude: Number(event.longitude),
                                        type: "event" // Tambahkan tipe untuk tooltip
                                    }}
                                    // Tampilkan lokasi pengguna jika tersedia (misal dari prop)
                                    // Jika ini Client Component, bisa pakai `userLoc={userLocation}` dari `useGeolocation`
                                    // userLoc={dummyUserLoc} // Ganti dengan userLocation dari context jika Client Component
                                    showRoute={true} // Tampilkan garis rute dari user ke event
                                    // zoomLevel={14} // Zoom lebih dekat untuk detail
                                    className="w-full h-full" // Buat RadarMaps mengisi div ini
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                                    Koordinat lokasi event tidak tersedia.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submitter/Approver Info */}
                    <div className="flex items-center gap-4 border-t pt-4 mt-4">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={getCreatorImage()} />
                            <AvatarFallback>{getInitialName(getCreatorName())}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Submitted by: {event.anonymousName || "Anonymous"}</p>
                            {event.status !== "PENDING" && event.createdBy && (
                                <p className="text-xs text-gray-500">Approved by: {event.createdBy.name || event.createdBy.username}</p>
                            )}
                            <p className="text-xs text-gray-500">Status: {getStatusBadge(event.status)}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 justify-end mt-4">
                    {event.status === "PENDING" && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, newStatus: "REJECTED" })}
                                className="border-red-500 text-red-500 hover:bg-red-50"
                                disabled={isSpecificActionPending && actionProcess?.action === "REJECTED"}
                            >
                                {isSpecificActionPending && actionProcess?.action === "REJECTED" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                                Reject
                            </Button>
                            <Button
                                onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, newStatus: "APPROVED" })}
                                className="bg-green-500 hover:bg-green-600"
                                disabled={isSpecificActionPending && actionProcess?.action === "APPROVED"}
                            >
                                {isSpecificActionPending && actionProcess?.action === "APPROVED" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                Approve
                            </Button>
                        </>
                    )}
                    {(event.status === "APPROVED" || event.status === "REJECTED") && (
                        <Button
                            variant="outline"
                            onClick={() => updateEventStatusMutation.mutate({ eventId: event.id, newStatus: event.status === "APPROVED" ? "REJECTED" : "APPROVED" })}
                            className={`${event.status === "APPROVED" ? "border-red-500 text-red-500 hover:bg-red-50" : "bg-green-500 hover:bg-green-600"}`}
                            disabled={isSpecificActionPending}
                        >
                            {isSpecificActionPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : (event.status === "APPROVED" ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />)}
                            {event.status === "APPROVED" ? "Revoke" : "Re-Approve"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};