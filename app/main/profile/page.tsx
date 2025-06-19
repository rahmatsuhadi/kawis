"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  MapPin,
  Search,
  Calendar,
  MessageCircle,
  User,
  Edit,
  Camera,
  Mail,
  Phone,
  MapPinIcon,
  CalendarDays,
  Shield,
  Heart,
  MessageSquare,
  Share2,
  LogOut,
} from "lucide-react"
import LogoutModal from "@/components/profile/ModalLogout"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

// Mock user data
const userData = {
  id: 1,
  name: "Moren Jordan",
  email: "moren.jordan@email.com",
  phone: "+62 812-3456-7890",
  bio: "Event enthusiast and community organizer. Love connecting people through amazing experiences and cultural events.",
  location: "Yogyakarta, Indonesia",
  joinDate: "15 Jan 2024",
  role: "admin",
  avatar: "/placeholder.svg?height=120&width=120",
  coverImage: "/placeholder.svg?height=200&width=800",
  stats: {
    eventsCreated: 5,
    postsCreated: 12,
    eventsAttended: 23,
    followers: 156,
    following: 89,
  },
}

// Mock user's events
const userEvents = [
  {
    id: 1,
    name: "Festival Budaya Yogyakarta",
    date: "25 Mei 2024",
    status: "approved",
    attendees: 120,
    image: "/placeholder.svg?height=100&width=150",
  },
  {
    id: 2,
    name: "Pasar Malam Tradisional",
    date: "30 Mei 2024",
    status: "pending",
    attendees: 0,
    image: "/placeholder.svg?height=100&width=150",
  },
]

// Mock user's posts
const userPosts = [
  {
    id: 1,
    content: "Amazing experience at the cultural festival! The traditional performances were absolutely stunning.",
    image: "/placeholder.svg?height=200&width=300",
    likes: 24,
    comments: 8,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    content: "Looking forward to organizing more community events. Let's bring people together!",
    image: "/placeholder.svg?height=200&width=300",
    likes: 18,
    comments: 5,
    timeAgo: "1 day ago",
  },
]

interface ProfileProps {
  onNavigateHome: () => void
  onNavigateMaps: () => void
  onNavigatePostEvent: () => void
  onNavigateEventManagement?: () => void
  onNavigateUserManagement?: () => void
}

export default function Profile({
  onNavigateHome,
  onNavigateMaps,
  onNavigatePostEvent,
  onNavigateEventManagement,
  onNavigateUserManagement,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  // const [editedData, setEditedData] = useState(userData)

  const {data} = useSession()

  if(!data) redirect("/")

    const user = data.user



  return (
    <>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-4 lg:mb-6">
            <div className="relative">
              {/* Cover Image */}
              <div className="h-32 lg:h-48 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg relative overflow-hidden">
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt="Cover"
                  fill
                  className="object-cover opacity-50"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 lg:top-4 right-2 lg:right-4 bg-white/80 hover:bg-white text-xs lg:text-sm"
                >
                  <Camera className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                  <span className="hidden sm:inline">Change Cover</span>
                </Button>
              </div>

              {/* Profile Info */}
              <CardContent className="pt-0 p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 lg:gap-6 -mt-12 lg:-mt-16 relative z-10">
                  <div className="relative">
                    <Avatar className="w-20 lg:w-32 h-20 lg:h-32 border-4 border-white">
                      <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg lg:text-2xl">MJ</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-6 lg:w-8 h-6 lg:h-8 p-0"
                    >
                      <Camera className="w-3 lg:w-4 h-3 lg:h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 text-center sm:text-left pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <h1 className="text-xl lg:text-2xl font-bold">{user.name}</h1>
                        <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1 mt-1 text-sm lg:text-base">
                          <MapPinIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                          {userData.location}
                        </p>
                        <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1 mt-1 text-sm lg:text-base">
                          <CalendarDays className="w-3 lg:w-4 h-3 lg:h-4" />
                          Joined {userData.joinDate}
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-orange-500 hover:bg-orange-600 mt-4 sm:mt-0 text-sm lg:text-base"
                      >
                        <Edit className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center sm:justify-start gap-4 lg:gap-6">
                      <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold text-orange-600">{userData.stats.eventsCreated}</p>
                        <p className="text-xs lg:text-sm text-gray-600">Events</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold text-blue-600">{userData.stats.postsCreated}</p>
                        <p className="text-xs lg:text-sm text-gray-600">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold text-green-600">{userData.stats.eventsAttended}</p>
                        <p className="text-xs lg:text-sm text-gray-600">Attended</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold text-purple-600">{userData.stats.followers}</p>
                        <p className="text-xs lg:text-sm text-gray-600">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg lg:text-xl font-bold text-pink-600">{userData.stats.following}</p>
                        <p className="text-xs lg:text-sm text-gray-600">Following</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm lg:text-base">
                  Full Name
                </Label>
                <Input id="name" defaultValue={userData.name} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email-settings" className="text-sm lg:text-base">
                  Email
                </Label>
                <Input id="email-settings" type="email" defaultValue={userData.email} className="mt-1" />
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-sm lg:text-base">Privacy Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-xs lg:text-sm">Make my profile public</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-xs lg:text-sm">Allow others to see my events</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-xs lg:text-sm">Send me email notifications</span>
                  </label>
                </div>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-sm lg:text-base">Save Settings</Button>
            </CardContent>
          </Card>


            <LogoutModal/>
        </div>
      </main>
    </>
  )
}