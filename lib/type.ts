import { Category, Event, User } from "@prisma/client"


export interface IEvent extends Event {
  images: string[]
  categories: Category[]
  distanceKm: number
  createdBy:User
}