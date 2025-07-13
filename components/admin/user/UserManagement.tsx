"use client"

import { useMemo, useState } from "react"
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
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { User, UserRole } from "@prisma/client"
import { formatDate } from "@/lib/formater"
import { QueryFunctionContext, useQuery } from "@tanstack/react-query"
import getInitialName from "@/lib/getInitialName"
import UserRowSkeleton from "./Card"


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


// --- User Detail Dialog Component ---
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
                    User Details - {user.name || user.username}
                </DialogTitle>
                <DialogDescription>Information about the user and management options</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={user.image || "/placeholder-user.jpg"} />
                        <AvatarFallback>
                            {getInitialName(user.name || user.username)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-lg font-semibold">{user.name || user.username}</h3>
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            Join Date
                        </label>
                        <p className="text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                </div>

                {/* Activity Stats */}
                {/* <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{user._count?.eventPosts || 0}</p>
                        <p className="text-sm text-gray-600">Events Posted</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{user._count?.approvedEvents || 0}</p>
                        <p className="text-sm text-gray-600">Events Approved</p>
                    </div>
                </div> */}

                {/* Role and Status Management (Placeholder for actual update logic) */}
                
            </div>
            <DialogFooter>
                {/* <Button variant="outline">Send Message</Button> */}
                <Button className="bg-orange-500 hover:bg-orange-600">Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);



export interface UsersApiResponse { // Type for the full API response
  users: User[];
  total: number;
}

// --- fetchUsers function ---
export async function fetchUsers(context: QueryFunctionContext): Promise<UsersApiResponse> {
    const [
        _key // eslint-disable-line @typescript-eslint/no-unused-vars
        ,
    filters // Filters object from queryKey
  ] = context.queryKey as [string, {
    roleFilter?: string; // "all", "admin", "user"
    statusFilter?: string; // "all", "active", "inactive", "suspended" (based on emailVerified)
    page?: number;
    limit?: number;
    // Add other filters like search term here if needed
  }];

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  let url = `/api/users?limit=${limit}&offset=${offset}`;

  if (filters.roleFilter && filters.roleFilter !== "all") {
    url += `&role=${filters.roleFilter.toUpperCase()}`; // API expects uppercase enum
  }

  console.log(`Fetching users for admin table from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to load users.");
  }
  const data: UsersApiResponse = await response.json();
  return data;
}

export default function UserManagementContainer() {

     // States for filters and pagination
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'verified', 'unverified'
    const [filterRole, setFilterRole] = useState("all"); // 'all', 'admin', 'user'
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5); // Items per page


     const {
        data,
        isLoading,
        isFetching,

    } = useQuery<UsersApiResponse, Error>({ 
        queryKey: ["users", { // Filters passed as an object
                roleFilter: filterRole,
                statusFilter: filterStatus, // Will filter client-side if API doesn't support
                page: currentPage,
                limit: usersPerPage
            }],
        queryFn: fetchUsers,
        refetchOnWindowFocus: true,
    });

    
    const users = useMemo(() =>  data?.users || [],[data?.users]);
    
    const totalUsers = data?.total || 0; // Total count for pagination
    const totalPages = Math.ceil(totalUsers / usersPerPage);


    // --- Client-side filtering by email verification status ---
    const filteredUsers = useMemo(() => {
        let currentUsers = users;

        // Apply role filter (API already handles this mostly, but client-side ensures consistency)
        if (filterRole !== "all") {
            currentUsers = currentUsers.filter(u => u.role === filterRole.toUpperCase());
        }

        // Apply status filter based on emailVerified
        if (filterStatus === "verified") {
            currentUsers = currentUsers.filter(u => !!u.emailVerified);
        } else if (filterStatus === "unverified") {
            currentUsers = currentUsers.filter(u => !u.emailVerified);
        }
        // "suspended" or "inactive" would need a dedicated field in your User model if you implement them.
        // For now, they'll just fall through or not filter.

        return currentUsers;
    }, [users, filterRole, filterStatus]);




    return (
      <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <div className="flex items-center gap-4">
                    {/* Role Filter */}
                    <Select value={filterRole} onValueChange={setFilterRole} disabled={isLoading || isFetching}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                            <SelectItem value={UserRole.USER}>User</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Status Filter (Email Verified) */}
                    <Select value={filterStatus} onValueChange={setFilterStatus} disabled={isLoading || isFetching}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                            {/* <SelectItem value="active">Active</SelectItem> */}
                            {/* <SelectItem value="inactive">Inactive</SelectItem> */}
                            {/* <SelectItem value="suspended">Suspended</SelectItem> */}
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
                                <p className="text-2xl font-bold">{totalUsers}</p> {/* Use totalUsers from API */}
                            </div>
                            <Users className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active (Verified) Users</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {users.filter((u) => !!u.emailVerified).length} {/* Filter from current data */}
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
                                    {users.filter((u) => u.role === UserRole.ADMIN).length} {/* Filter from current data */}
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
                                <p className="text-sm text-gray-600">Unverified Users</p> {/* Changed from Suspended */}
                                <p className="text-2xl font-bold text-red-600">
                                    {users.filter((u) => !u.emailVerified).length} {/* Filter from current data */}
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
                                <TableHead className="text-white font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading || isFetching ? ( // Condition for global table loading
                                // --- Loading Skeleton Rows ---
                                Array.from({ length: usersPerPage }).map((_, i) => (
                                    <UserRowSkeleton key={i} />
                                ))
                            ) : filteredUsers.length === 0 ? (
                                // --- No Users Found Message ---
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                                        No users found for this filter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // --- Actual User Rows ---
                                filteredUsers.map((user, index) => (
                                    <TableRow key={user.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={user.image || "/placeholder-user.jpg"} />
                                                    <AvatarFallback>{getInitialName(user.name || user.username)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name || user.username}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>{getStatusBadge(!!user.emailVerified)}</TableCell>
                                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <UserDetailDialog user={user} />
                                                {/* Actions like suspend/activate */}
                                                {/* <Button variant="outline" size="sm" className="border-red-500 text-red-500">Suspend</Button> */}
                                                {/* <Button variant="outline" size="sm" className="border-green-500 text-green-500">Activate</Button> */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading || isFetching}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-gray-700 text-sm">
                    Page {currentPage} of {totalPages} ({totalUsers} users)
                </span>
                <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading || isFetching}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}