"use client"

import { useState } from "react"
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
import { Calendar, Eye, Check, X, Loader2 } from "lucide-react"
import StaticCard from "@/components/admin/event/StaticCard"
import { QueryFunctionContext, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { EventsApiResponse } from "@/components/event/EventList"
import { formatDate } from "@/lib/formater"
import { Event, EventStatus } from "@prisma/client"
import { toast } from "sonner"

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



export async function fetchEvents(context: QueryFunctionContext): Promise<EventsApiResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_key,] = context.queryKey as [string]

    const url = `/api/events`;

    //   url += `?lat=${lat}&lng=${lng}&sort=distance`;


    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memuat event.");
    }
    const data: EventsApiResponse = await response.json(); // Cast data ke tipe yang benar
    return data;
}



export default function EventManagementContainer() {
 const queryClient = useQueryClient();

 const [actionProcess, setActionProcess] = useState<{action: Omit<EventStatus, "PENDING">, id:string} | null>(null)


    const {
        data,
        isLoading,
    } = useQuery<EventsApiResponse, Error>({ // Gunakan EventsApiResponse sebagai tipe data
        // queryKey: ["events",],
        queryKey: ["events"],
        queryFn: fetchEvents,
        refetchOnWindowFocus: true,
    });


    const events = data?.events || [];

    const [filterStatus, setFilterStatus] = useState("all")


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
            setActionProcess(null)
            queryClient.invalidateQueries({ queryKey: ["events"] }); // Invalidate list event cache
            // You might also invalidate event-detail cache if applicable
        },
        onError: (error) => {
            setActionProcess(null)
            toast.error("Failed to update status", { description: error.message || "An unknown error occurred." });
        },
    });

    const handleStatusChange = (eventId: string, newStatus:"APPROVED" | "REJECTED") => {
        setActionProcess({action: newStatus, id: eventId})
        updateEventStatusMutation.mutate({ eventId, newStatus: newStatus });
    };


    const filteredEvents = events.filter((event) => filterStatus === "all" || event.status === filterStatus)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const EventDetailDialog = ({ event }: { event: Event }) => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Detail Event
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {event.name}
                    </DialogTitle>
                    <DialogDescription>Event details and management options</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Created By</label>
                            <p className="text-sm">{event.anonymousName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <div className="mt-1">{getStatusBadge(event.status)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Duration</label>
                            <p className="text-sm">{formatDate(event.startDate) + "-" + formatDate(event.endDate)}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Location</label>
                            <p className="text-sm">{event.address}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Submitted Date</label>
                            <p className="text-sm">{formatDate(event.createdAt)}</p>
                        </div>
                        {/* <div>
                            <label className="text-sm font-medium text-gray-600">Attendees</label>
                            <p className="text-sm">{event.attendees} people</p>
                        </div> */}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-sm mt-1">{event.description}</p>
                    </div>
                </div>
                <DialogFooter className="flex gap-2">
                    {event.status === "PENDING" && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleStatusChange(event.id, "REJECTED")}
                                className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleStatusChange(event.id, "APPROVED")}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                            </Button>
                        </>
                    )}
                    {event.status === "APPROVED" && (
                        <Button
                            variant="outline"
                            onClick={() => handleStatusChange(event.id, "REJECTED")}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Revoke Approval
                        </Button>
                    )}
                    {event.status === "REJECTED" && (
                        <Button
                            onClick={() => handleStatusChange(event.id, "APPROVED")}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    return (
        <div className="max-w-7xl mx-auto">
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
            approved={events.filter(item=> item.status=="APPROVED").length}
            pending={events.filter(item=> item.status=="PENDING").length} 
            rejected={events.filter(item=> item.status=="REJECTED").length}
            total={data?.total || 0}
            />

            {/* Events Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-orange-500 hover:bg-orange-500">
                                <TableHead className="text-white font-semibold">#</TableHead>
                                <TableHead className="text-white font-semibold">Nama Event</TableHead>
                                <TableHead className="text-white font-semibold">Durasi</TableHead>
                                <TableHead className="text-white font-semibold">Dibuat Oleh</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                {/* <TableHead className="text-white font-semibold">Attendees</TableHead> */}
                                <TableHead className="text-white font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? Array.from({ length: 5 }).map((_, i) => ( // Display 5 skeleton rows
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell className="font-medium">
                                        <div className="h-4 bg-gray-200 rounded w-4" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 bg-gray-200 rounded-md" />
                                            <div className="h-8 w-8 bg-gray-200 rounded-md" />
                                            <div className="h-8 w-8 bg-gray-200 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : filteredEvents.map((event, index) => (
                                <TableRow key={event.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="truncate max-w-[150px]">{event.name}</TableCell>
                                    <TableCell>{formatDate(event.startDate) + "-" + formatDate(event.endDate)}</TableCell>
                                    <TableCell>{event.anonymousName}</TableCell>
                                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                                    {/* <TableCell>{event.attendees}</TableCell> */}
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <EventDetailDialog event={event} />
                                            {event.status === "PENDING" && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                         disabled={updateEventStatusMutation.isPending && actionProcess?.id== event.id}
                                                        onClick={() => handleStatusChange(event.id, "APPROVED")}
                                                        className="bg-green-500 hover:bg-green-600 h-8 px-2"
                                                    >
                                                        {updateEventStatusMutation.isPending && actionProcess?.id== event.id && actionProcess.action=="APPROVED" ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3" /> }
                                                        
                                                    </Button>
                                                    <Button
                                                     disabled={updateEventStatusMutation.isPending && actionProcess?.id== event.id}
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(event.id, "REJECTED")}
                                                        className="border-red-500 text-red-500 hover:bg-red-50 h-8 px-2"
                                                    >
                                                        
                                                        
                                                        {updateEventStatusMutation.isPending && actionProcess?.id== event.id && actionProcess.action=="REJECTED" ? <Loader2 className="w-3 h-3 animate-spin"/> : <X className="w-3 h-3" />}
                                                        

                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}