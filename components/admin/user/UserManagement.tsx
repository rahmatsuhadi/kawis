"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
    Eye,
    Shield,
    Users,
    UserCheck,
    UserX,
    Mail,
    CalendarDays,
} from "lucide-react"
import { User, UserRole } from "@prisma/client"
import { formatDate } from "@/lib/formater"
import { QueryFunctionContext, useQuery } from "@tanstack/react-query"
import getInitialName from "@/lib/getInitialName"

// Mock data for users
// const usersData = [
//     {
//         id: 1,
//         name: "Moren Jordan",
//         email: "moren.jordan@email.com",
//         phone: "+62 812-3456-7890",
//         role: "admin",
//         status: "active",
//         joinDate: "15 Jan 2024",
//         lastLogin: "2 hours ago",
//         location: "Yogyakarta",
//         eventsCreated: 5,
//         postsCreated: 12,
//         avatar: "/placeholder.jpg?height=40&width=40",
//     },
//     {
//         id: 2,
//         name: "Zahra Kuliawati",
//         email: "zahra.kuliawati@email.com",
//         phone: "+62 813-4567-8901",
//         role: "user",
//         status: "active",
//         joinDate: "20 Jan 2024",
//         lastLogin: "1 day ago",
//         location: "Sleman",
//         eventsCreated: 2,
//         postsCreated: 8,
//         avatar: "/placeholder.jpg?height=40&width=40",
//     },
//     {
//         id: 3,
//         name: "Deny Caknan",
//         email: "deny.caknan@email.com",
//         phone: "+62 814-5678-9012",
//         role: "user",
//         status: "active",
//         joinDate: "10 Feb 2024",
//         lastLogin: "3 hours ago",
//         location: "Bantul",
//         eventsCreated: 3,
//         postsCreated: 15,
//         avatar: "/placeholder.jpg?height=40&width=40",
//     },
//     {
//         id: 4,
//         name: "Jihan Audy",
//         email: "jihan.audy@email.com",
//         phone: "+62 815-6789-0123",
//         role: "user",
//         status: "inactive",
//         joinDate: "25 Feb 2024",
//         lastLogin: "1 week ago",
//         location: "Yogyakarta",
//         eventsCreated: 1,
//         postsCreated: 3,
//         avatar: "/placeholder.jpg?height=40&width=40",
//     },
//     {
//         id: 5,
//         name: "Bille Warsin",
//         email: "bille.warsin@email.com",
//         phone: "+62 816-7890-1234",
//         role: "user",
//         status: "suspended",
//         joinDate: "5 Mar 2024",
//         lastLogin: "2 weeks ago",
//         location: "Kulon Progo",
//         eventsCreated: 0,
//         postsCreated: 1,
//         avatar: "/placeholder.jpg?height=40&width=40",
//     },
// ]

const getRoleBadge = (role: UserRole) => {
    switch (role) {
        case "ADMIN":
            return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Admin</Badge>
        case "USER":
            return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">User</Badge>
        default:
            return <Badge variant="secondary">Unknown</Badge>
    }
}

const getStatusBadge = (status: boolean) => {
    if (status) {
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Terverifikasi</Badge>
    }
    else {
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Tidak Verif</Badge>

    }
}




const UserDetailDialog = ({ user }: { user: User }) => (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Detail
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Details - {user.fullName}
                </DialogTitle>
                <DialogDescription>Informasi tentang pengguna dan management</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={user.image || "/placeholder.jpg"} />
                        <AvatarFallback>
                            {(user.fullName as string)
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-semibold">{user.fullName}</h3>
                        <div className="flex gap-2 mt-1">
                            {getRoleBadge(user.role)}
                            {getStatusBadge(!!user.emailVerified)}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <p className="text-sm">{user.email}</p>
                    </div>
                    {/* <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            Location
                        </label>
                        <p className="text-sm">{user.location}</p>
                    </div> */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            Join Date
                        </label>
                        <p className="text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        {/* <p className="text-2xl font-bold text-orange-600">{user}</p> */}
                        <p className="text-sm text-gray-600">Events Created</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        {/* <p className="text-2xl font-bold text-blue-600">{user.postsCreated}</p> */}
                        <p className="text-sm text-gray-600">Posts Created</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Last Login</p>
                        {/* <p className="text-sm text-gray-900">{user.lastLogin}</p> */}
                    </div>
                </div>

                {/* Role and Status Management */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Change Role</label>
                        <Select value={user.role} onValueChange={(value) => console.log(user.id, value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Change Status</label>
                        {/* <Select value={!!user.emailVerified} onValueChange={(value) => console.log(user.id, value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select> */}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline">Send Message</Button>
                <Button className="bg-orange-500 hover:bg-orange-600">Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
)



export interface EventsApiResponse {
  users: User[]; // Array event sesuai tipe Event di atas
  total: number; // Total jumlah event
}

export async function fetchEvents(context: QueryFunctionContext): Promise<EventsApiResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_key,] = context.queryKey as [string]

    const url = `/api/users`;

    //   url += `?lat=${lat}&lng=${lng}&sort=distance`;


    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memuat users.");
    }
    const data: EventsApiResponse = await response.json(); // Cast data ke tipe yang benar
    return data;
}

export default function UserManagementContainer() {

    const [filterStatus, setFilterStatus] = useState("all")
    const [filterRole, setFilterRole] = useState("all")

     const {
        data,
    } = useQuery<EventsApiResponse, Error>({ 
        queryKey: ["users"],
        queryFn: fetchEvents,
        refetchOnWindowFocus: true,
    });

    
    const users = data?.users || [];


    // const handleStatusChange = (userId: number, newStatus: string) => {
        // setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    // }

    // const handleRoleChange = (userId: number, newRole: string) => {
        // setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    // }

    // const filteredUsers = users.filter((user) => {
    //     const statusMatch = filterStatus === "all" || user.rol === filterStatus
    //     const roleMatch = filterRole === "all" || user.role === filterRole
    //     return statusMatch && roleMatch
    // })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <div className="flex items-center gap-4">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
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
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold">{users.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {users.filter((u) => !!u.emailVerified).length}
                                </p>
                            </div>
                            <UserCheck className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Admins</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {users.filter((u) => u.role === "ADMIN").length}
                                </p>
                            </div>
                            <Shield className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {users.filter((u) => !!!u.emailVerified).length}
                                </p>
                            </div>
                            <UserX className="w-8 h-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-orange-500 hover:bg-orange-500">
                                <TableHead className="text-white font-semibold">#</TableHead>
                                <TableHead className="text-white font-semibold">User</TableHead>
                                <TableHead className="text-white font-semibold">Email</TableHead>
                                <TableHead className="text-white font-semibold">Role</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                <TableHead className="text-white font-semibold">Join Date</TableHead>
                                <TableHead className="text-white font-semibold">Last Login</TableHead>
                                <TableHead className="text-white font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user, index) => (
                                <TableRow key={user.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.image || "/placeholder.jpg"} />
                                                <AvatarFallback>
                                                    {getInitialName(user.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.fullName}</p>
                                                {/* <p className="text-xs text-gray-500">{user.location}</p> */}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{getStatusBadge(!!user.emailVerified)}</TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    {/* <TableCell>{user.lastLogin}</TableCell> */}
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <UserDetailDialog user={user} />
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