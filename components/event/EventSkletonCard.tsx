
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card"; // Asumsi Card dari shadcn/ui
import { Avatar, AvatarFallback } from '../ui/avatar';

export default function EventCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border shadow-md animate-pulse">
      <CardContent className="p-3">
        <div className="flex gap-3 items-start w-full">
          {/* Image Placeholder */}
          <div className="rounded-lg bg-gray-200 flex-shrink-0" style={{ width: 80, height: 80 }}></div>

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
                <div className="h-3 bg-gray-200 rounded w-20"></div> {/* Text placeholder */}
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 mr-1 bg-gray-200 rounded-full"></div> {/* Icon placeholder */}
                <div className="h-3 bg-gray-200 rounded w-12"></div> {/* Text placeholder */}
              </div>
            </div>

            {/* Organizer and Attendees Placeholders */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {/* Organizer Avatar and Name */}
                <Avatar className="h-6 w-6 bg-gray-200">
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                <div className="h-3 w-24 bg-gray-200 rounded"></div> {/* Organizer name placeholder */}
                {/* Category Badge Placeholder */}
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
                {/* <div className="h-8 w-8 bg-gray-200 rounded-full"></div> Heart Button Placeholder */}
                {/* <div className="h-8 w-8 bg-gray-200 rounded-full"></div> Share Button Placeholder */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}