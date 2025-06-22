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
import {  Calendar, Eye, Check, X, Clock } from "lucide-react"

// Mock data for events with admin management info
const eventsData = [
  {
    id: 1,
    name: "Pasar Murah Meriah",
    duration: "20 Mei 2024 - 20 Mei 2024",
    createdBy: "Deny Caknan",
    status: "pending",
    submittedDate: "15 Mei 2024",
    description: "Event pasar murah dengan berbagai macam makanan dan minuman tradisional",
    location: "Yogyakarta",
    attendees: 0,
  },
  {
    id: 2,
    name: "Pasar Murah Meriah",
    duration: "20 Mei 2024 - 20 Mei 2024",
    createdBy: "Jihan Audy",
    status: "approved",
    submittedDate: "14 Mei 2024",
    description: "Festival makanan tradisional dengan harga terjangkau",
    location: "Sleman",
    attendees: 45,
  },
  {
    id: 3,
    name: "Pasar Murah Meriah",
    duration: "20 Mei 2024 - 20 Mei 2024",
    createdBy: "Bille Warsin",
    status: "rejected",
    submittedDate: "13 Mei 2024",
    description: "Event kuliner dengan tema tradisional Jawa",
    location: "Bantul",
    attendees: 0,
  },
  {
    id: 4,
    name: "Festival Budaya Yogyakarta",
    duration: "25 Mei 2024 - 27 Mei 2024",
    createdBy: "Sari Dewi",
    status: "approved",
    submittedDate: "10 Mei 2024",
    description: "Festival budaya dengan pertunjukan seni tradisional",
    location: "Malioboro",
    attendees: 120,
  },
  {
    id: 5,
    name: "Konser Musik Indie",
    duration: "30 Mei 2024 - 30 Mei 2024",
    createdBy: "Andi Pratama",
    status: "pending",
    submittedDate: "16 Mei 2024",
    description: "Konser musik indie dengan band-band lokal",
    location: "Taman Budaya",
    attendees: 0,
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}



export default function EventManagement() {
  const [events, setEvents] = useState(eventsData)
  const [filterStatus, setFilterStatus] = useState("all")

  const handleStatusChange = (eventId: number, newStatus: string) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, status: newStatus } : event)))
  }

  const filteredEvents = events.filter((event) => filterStatus === "all" || event.status === filterStatus)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const EventDetailDialog = ({ event }: { event: any }) => (
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
              <p className="text-sm">{event.createdBy}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">{getStatusBadge(event.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Duration</label>
              <p className="text-sm">{event.duration}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Location</label>
              <p className="text-sm">{event.location}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Submitted Date</label>
              <p className="text-sm">{event.submittedDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Attendees</label>
              <p className="text-sm">{event.attendees} people</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Description</label>
            <p className="text-sm mt-1">{event.description}</p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          {event.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange(event.id, "rejected")}
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                onClick={() => handleStatusChange(event.id, "approved")}
                className="bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </>
          )}
          {event.status === "approved" && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange(event.id, "rejected")}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Revoke Approval
            </Button>
          )}
          {event.status === "rejected" && (
            <Button
              onClick={() => handleStatusChange(event.id, "approved")}
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
    <>
    <main className="flex-1 p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {events.filter((e) => e.status === "pending").length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {events.filter((e) => e.status === "approved").length}
                      </p>
                    </div>
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {events.filter((e) => e.status === "rejected").length}
                      </p>
                    </div>
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-500 hover:bg-orange-500">
                      <TableHead className="text-white font-semibold">#</TableHead>
                      <TableHead className="text-white font-semibold">Nama Event</TableHead>
                      <TableHead className="text-white font-semibold">Durasi Event</TableHead>
                      <TableHead className="text-white font-semibold">Dibuat Oleh</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                      <TableHead className="text-white font-semibold">Attendees</TableHead>
                      <TableHead className="text-white font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event, index) => (
                      <TableRow key={event.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>{event.duration}</TableCell>
                        <TableCell>{event.createdBy}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>{event.attendees}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <EventDetailDialog event={event} />
                            {event.status === "pending" && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(event.id, "approved")}
                                  className="bg-green-500 hover:bg-green-600 h-8 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(event.id, "rejected")}
                                  className="border-red-500 text-red-500 hover:bg-red-50 h-8 px-2"
                                >
                                  <X className="w-3 h-3" />
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
        </main>
    </>
  )
}