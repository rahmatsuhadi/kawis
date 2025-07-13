
"use client"
import { IEvent } from "@/lib/type";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, Heart, MapPin, Share2 } from "lucide-react";
import { formatDate, formatTime } from "@/lib/formater";
import getInitialName from "@/lib/getInitialName";
import { formatRupiah } from "@/lib/format-rupiah";



export const EventListItemSkeletonExplore = () => {
    return (
        <Card className="border rounded-lg shadow-md animate-pulse">
            <CardContent className="p-3">
                <div className="flex gap-3 items-start w-full">
                    {/* Image Placeholder (mimics w-20 h-20 rounded-lg object-cover) */}
                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0"></div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                {/* Title Placeholder */}
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                                {/* Location Placeholder */}
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <div className="h-3 w-3 mr-1 bg-gray-200 rounded-full"></div> {/* Icon placeholder */}
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div> {/* Text placeholder */}
                                </div>
                            </div>
                            {/* Distance Badge Placeholder */}
                            <div className="h-5 w-16 bg-gray-200 rounded-md flex-shrink-0 ml-2"></div>
                        </div>

                        {/* Date and Time Placeholders */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                                <div className="h-3 w-3 mr-1 bg-gray-200 rounded-full"></div> {/* Icon placeholder */}
                                <div className="h-3 w-20 bg-gray-200 rounded"></div> {/* Text placeholder */}
                            </div>
                            <div className="flex items-center">
                                <div className="h-3 w-3 mr-1 bg-gray-200 rounded-full"></div> {/* Icon placeholder */}
                                <div className="h-3 w-12 bg-gray-200 rounded"></div> {/* Text placeholder */}
                            </div>
                        </div>

                        {/* Organizer and Categories/Tags Placeholders */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                {/* Organizer Avatar and Name */}
                                <Avatar className="h-6 w-6 bg-gray-200">
                                    <AvatarFallback></AvatarFallback>
                                </Avatar>
                                <div className="h-3 w-24 bg-gray-200 rounded"></div> {/* Organizer name placeholder */}
                                {/* Category/Tag Badge Placeholder */}
                                <div className="h-5 w-16 bg-gray-200 rounded-md ml-2"></div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                                {/* Attendees Placeholder */}
                                <div className="flex items-center">
                                    <div className="h-3 w-3 mr-1 bg-gray-200 rounded-full"></div> {/* Icon placeholder */}
                                    <div className="h-3 w-8 bg-gray-200 rounded"></div> {/* Number placeholder */}
                                </div>
                            </div>
                        </div>

                        {/* Price and Action Buttons Placeholders */}
                        <div className="flex items-center justify-between mt-3">
                            {/* Price Placeholder */}
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            <div className="flex gap-1">
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div> {/* Heart Button Placeholder */}
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div> {/* Share Button Placeholder */}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


interface EventCardProps {
    event: IEvent;
    idx: number
}



export const EventCardExplore = ({ event, idx }: EventCardProps) => {
    return (
        <Card key={event.id}
            className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-2 animate-slideUp"
            style={{ animationDelay: `${idx * 0.1}s` }} // If using index from map function in parent
        >
            <Link href={`/main/e/${event.id}`} className="block">
                <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                            src={event.images[0] || "/placeholder.jpg"} // Use optional chaining for images[0]
                            alt={event.name}
                            width={300} // Set explicit width for Next/Image optimization (adjust as needed for grid)
                            height={200} // Set explicit height for Next/Image optimization (adjust as needed for grid)
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 rounded-t-lg" // Image styling
                        />

                    
                        {/* Distance Badge */}
                        <div className="absolute top-3 right-3 z-10"> {/* Added z-10 */}
                            {event.distanceKm !== null && (
                                <Badge variant="outline" className="bg-white  text-gray-700">
                                    {event.distanceKm.toFixed(1)} KM
                                </Badge>
                            )}
                        </div>

                        {/* Quick Actions (Heart, Share) - Hidden until hover */}
                        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"> {/* Added z-10 */}
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0 bg-white bg-opacity-90 hover:bg-opacity-100"
                            // onClick={handleLike} // Add actual like logic
                            >
                                <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0 bg-white bg-opacity-90 hover:bg-opacity-100"
                            // onClick={handleShare} // Add actual share logic
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Category */}
                        {event.categories && event.categories.length > 0 && (
                            <Badge
                                className={`mb-3 bg-primary`} // Use slug for color  mapping
                            >
                                {event.categories[0]?.name}
                            </Badge>
                        )}

                        {/* Title */}
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {event.name}
                        </h3>

                        {/* Description */}
                        <div className="text-gray-600 text-sm mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: event.description || '' }}></div>

                        {/* Event Details (Date, Time, Location, Attendees) */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                                <span>
                                    {formatDate(event.startDate)} • {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                <span className="truncate">{event.address || "Location not specified"}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {event.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={tag || index} variant="outline" className="text-xs border-orange-200 text-orange-700"> 
                                        {tag}
                                    </Badge>
                                ))}
                                {event.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                                        +{event.tags.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Organizer & Price */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={event.createdBy?.image || "/placeholder.svg"} /> 
                                    <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                                        {getInitialName(event.organizerName || event.anonymousName || "Anonymous")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-medium text-gray-900 flex items-center">
                                        {event.organizerName || event.anonymousName || "Anonymous"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-orange-600">{formatRupiah(event.price?.toString())}</p>
                            </div>
                        </div>

                    </div>
                </CardContent>

            </Link>

        </Card>
    );
};
