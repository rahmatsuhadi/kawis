"use client"


import CardProfile from "@/components/profile/CardProfile"


// Mock user's events
// const userEvents = [
//   {
//     id: 1,
//     name: "Festival Budaya Yogyakarta",
//     date: "25 Mei 2024",
//     status: "approved",
//     attendees: 120,
//     image: "/placeholder.jpg?height=100&width=150",
//   },
//   {
//     id: 2,
//     name: "Pasar Malam Tradisional",
//     date: "30 Mei 2024",
//     status: "pending",
//     attendees: 0,
//     image: "/placeholder.jpg?height=100&width=150",
//   },
// ]

// Mock user's posts
// const userPosts = [
//   {
//     id: 1,
//     content: "Amazing experience at the cultural festival! The traditional performances were absolutely stunning.",
//     image: "/placeholder.jpg?height=200&width=300",
//     likes: 24,
//     comments: 8,
//     timeAgo: "2 hours ago",
//   },
//   {
//     id: 2,
//     content: "Looking forward to organizing more community events. Let's bring people together!",
//     image: "/placeholder.jpg?height=200&width=300",
//     likes: 18,
//     comments: 5,
//     timeAgo: "1 day ago",
//   },
// ]



export default function Profile({
}) {


  return (
    <>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto">
          <CardProfile/>
        </div>
      </main>
    </>
  )
}