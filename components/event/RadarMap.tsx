"use client"

import { useState, useMemo } from "react"
import Map, {  Layer, Marker, Source } from "react-map-gl/mapbox"
import { MapPin, Calendar } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"
import { useGeolocation } from "@/context/geolocation-context"

interface RadarMapsProps {
  // Required props
  eventLocation: {
    latitude: number
    longitude: number
    name: string
    type?: string
  }

  // Optional props
  currentLocation?: {
    latitude: number
    longitude: number
  }
  showRoute?:boolean,
  width?: number
  height?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEventClick?: (event: any) => void
  onCurrentLocationClick?: () => void
  className?: string
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}


// Function to create route line GeoJSON
function createRouteLine(start: [number, number], end: [number, number]) {
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [start, end],
        },
        properties: {},
      },
    ],
  }
}


export default function RadarMaps({
  eventLocation,
  currentLocation,
  onEventClick,
  showRoute = false, // Default to false
  onCurrentLocationClick,
  className = "",
}: RadarMapsProps) {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)


  const {location} = useGeolocation()

  const userLoc = location || currentLocation

   const routeGeoJson = useMemo(() => {
    if (showRoute && userLoc && eventLocation) {
      return createRouteLine(
        [userLoc.longitude, userLoc.latitude],
        [eventLocation.longitude, eventLocation.latitude]
      );
    }
    return null;
  }, [showRoute, userLoc, eventLocation]);

  // Calculate map center and zoom
  const { mapCenter, zoomLevel } = useMemo(() => {
    if (!userLoc) {
      // Only event location
      return {
        mapCenter: eventLocation,
        zoomLevel: 15,
      }
    }

    // Both locations - calculate center between them
    const centerLat = (eventLocation.latitude + userLoc.latitude) / 2
    const centerLng = (eventLocation.longitude + userLoc.longitude) / 2

    // Calculate distance to determine zoom
    const distance = calculateDistance(
      eventLocation.latitude,
      eventLocation.longitude,
      userLoc.latitude,
      userLoc.longitude,
    )
    let zoom = 15
    if (distance > 20) zoom = 10
    else if (distance > 10) zoom = 11
    else if (distance > 5) zoom = 12
    else if (distance > 2) zoom = 13
    else if (distance > 1) zoom = 14

    return {
      mapCenter: {
        latitude: centerLat,
        longitude: centerLng,
      },
      zoomLevel: zoom,
    }
  }, [eventLocation, userLoc])


  return (
    <div className={`relative bg-white shadow-2xl rounded-lg overflow-hidden ${className}`}>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: mapCenter.longitude,
          latitude: mapCenter.latitude,
          zoom: zoomLevel,
        }}
        style={{ width: "100%", height: "100%" }} // Map fills its direct parent (the div above)
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL}
        attributionControl={false}
        interactive={true} // Allow user interaction
      >
        {/* Route Line */}
        {routeGeoJson && (
          <Source id="route-line" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-line-layer"
              type="line"
              paint={{
                "line-color": "#007bff", // Blue color for the line
                "line-width": 4,
                "line-dasharray": [2, 2], // Dashed line
              }}
            />
          </Source>
        )}

        {/* Event location marker (always shown on this map) */}
        <Marker longitude={eventLocation.longitude} latitude={eventLocation.latitude} anchor="center">
          <div
            className="relative group"
            onMouseEnter={() => setHoveredMarker("event")}
            onMouseLeave={() => setHoveredMarker(null)}
            onClick={() => onEventClick?.(eventLocation)}
          >
            {/* Event marker visual */}
            <div className="w-12 h-12 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6 text-white" />
            </div>

            {/* Tooltip on hover */}
            {hoveredMarker === "event" && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-black text-white text-sm rounded whitespace-nowrap opacity-100 transition-opacity pointer-events-none z-20 max-w-xs">
                <div className="font-medium">{eventLocation.name}</div>
                {eventLocation.type && <div className="text-xs opacity-75 capitalize">{eventLocation.type}</div>}
                <div className="text-xs opacity-75">📍 Lokasi Event</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
              </div>
            )}
          </div>
        </Marker>

        {/* Current location marker (optional, only if userLoc is provided) */}
        {userLoc && (
          <Marker longitude={userLoc.longitude} latitude={userLoc.latitude} anchor="center">
            <div
              className="relative group"
              onMouseEnter={() => setHoveredMarker("current")}
              onMouseLeave={() => setHoveredMarker(null)}
              onClick={() => onCurrentLocationClick?.()}
            >
              {/* Current location marker visual */}
              <div className="w-10 h-10 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <MapPin className="h-5 w-5 text-white" />
              </div>

              {/* Tooltip on hover */}
              {hoveredMarker === "current" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-black text-white text-sm rounded whitespace-nowrap opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="font-medium">Lokasi Sekarang</div>
                  <div className="text-xs opacity-75">📍 Lokasi Anda</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-2 border-transparent border-t-black"></div>
                </div>
              )}
            </div>
          </Marker>
        )}
      </Map>

      {/* Floating Recenter Button (Optional, if this component manages its own recentering) */}
      {/* Assuming this button is managed by the parent MapsPage, removed from here */}
      {/* Radar Pulse Effect (Optional, assuming parent handles this if it's for user location) */}
    </div>
  )
}
