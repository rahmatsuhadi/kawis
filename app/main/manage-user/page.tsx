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
  Phone,
  MapPinIcon,
  CalendarDays,
} from "lucide-react"

// Mock data for users
const usersData = [
  {
    id: 1,
    name: "Moren Jordan",
    email: "moren.jordan@email.com",
    phone: "+62 812-3456-7890",
    role: "admin",
    status: "active",
    joinDate: "15 Jan 2024",
    lastLogin: "2 hours ago",
    location: "Yogyakarta",
    eventsCreated: 5,
    postsCreated: 12,
    avatar: "/placeholder.jpg?height=40&width=40",
  },
  {
    id: 2,
    name: "Zahra Kuliawati",
    email: "zahra.kuliawati@email.com",
    phone: "+62 813-4567-8901",
    role: "user",
    status: "active",
    joinDate: "20 Jan 2024",
    lastLogin: "1 day ago",
    location: "Sleman",
    eventsCreated: 2,
    postsCreated: 8,
    avatar: "/placeholder.jpg?height=40&width=40",
  },
  {
    id: 3,
    name: "Deny Caknan",
    email: "deny.caknan@email.com",
    phone: "+62 814-5678-9012",
    role: "user",
    status: "active",
    joinDate: "10 Feb 2024",
    lastLogin: "3 hours ago",
    location: "Bantul",
    eventsCreated: 3,
    postsCreated: 15,
    avatar: "/placeholder.jpg?height=40&width=40",
  },
  {
    id: 4,
    name: "Jihan Audy",
    email: "jihan.audy@email.com",
    phone: "+62 815-6789-0123",
    role: "user",
    status: "inactive",
    joinDate: "25 Feb 2024",
    lastLogin: "1 week ago",
    location: "Yogyakarta",
    eventsCreated: 1,
    postsCreated: 3,
    avatar: "/placeholder.jpg?height=40&width=40",
  },
  {
    id: 5,
    name: "Bille Warsin",
    email: "bille.warsin@email.com",
    phone: "+62 816-7890-1234",
    role: "user",
    status: "suspended",
    joinDate: "5 Mar 2024",
    lastLogin: "2 weeks ago",
    location: "Kulon Progo",
    eventsCreated: 0,
    postsCreated: 1,
    avatar: "/placeholder.jpg?height=40&width=40",
  },
]

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Admin</Badge>
    case "user":
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">User</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
    case "inactive":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Inactive</Badge>
    case "suspended":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Suspended</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}



export default function UserManagement() {
  const [users, setUsers] = useState(usersData)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRole, setFilterRole] = useState("all")

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
  }

  const filteredUsers = users.filter((user) => {
    const statusMatch = filterStatus === "all" || user.status === filterStatus
    const roleMatch = filterRole === "all" || user.role === filterRole
    return statusMatch && roleMatch
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const UserDetailDialog = ({ user }: { user: any }) => (
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
            User Details - {user.name}
          </DialogTitle>
          <DialogDescription>Complete user information and management options</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || "/placeholder.jpg"} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <div className="flex gap-2 mt-1">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
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
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <p className="text-sm">{user.phone}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                Location
              </label>
              <p className="text-sm">{user.location}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Join Date
              </label>
              <p className="text-sm">{user.joinDate}</p>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{user.eventsCreated}</p>
              <p className="text-sm text-gray-600">Events Created</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{user.postsCreated}</p>
              <p className="text-sm text-gray-600">Posts Created</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Last Login</p>
              <p className="text-sm text-gray-900">{user.lastLogin}</p>
            </div>
          </div>

          {/* Role and Status Management */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Change Role</label>
              <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
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
              <Select value={user.status} onValueChange={(value) => handleStatusChange(user.id, value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
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

  return (
    <>
     {/* Main Content */}
        <main className="flex-1 p-6">
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
                        {users.filter((u) => u.status === "active").length}
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
                        {users.filter((u) => u.role === "admin").length}
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
                        {users.filter((u) => u.status === "suspended").length}
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
                    {filteredUsers.map((user, index) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar || "/placeholder.jpg"} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.location}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
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
        </main>
    </>
  )
}