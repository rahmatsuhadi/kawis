import { Category, Event, EventPost, PostLike, User } from "@prisma/client"


export interface IEvent extends Event {
  images: string[]
  categories: Category[]
  distanceKm: number
  createdBy:User
}

export interface IPost extends EventPost {
    images: string[]
    postLike: PostLike[]
    event: {
        name: string
    }
    user: User
}