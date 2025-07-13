import { useEffect, useState } from "react";
import { Marker } from "react-map-gl/mapbox";
import { EventResponse } from "../event/EventList";

const MapMarkers = ({ locations }: { locations: EventResponse[] }) => {
  const [activeMarker, setActiveMarker] = useState<string | null>(null); // Menyimpan marker aktif yang sedang diklik
  const [isMobile, setIsMobile] = useState(false); // Untuk mendeteksi apakah perangkat mobile

  // Efek untuk mendeteksi ukuran layar (mobile vs desktop)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Tentukan apakah ini perangkat mobile
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Pastikan untuk memanggil saat pertama kali

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClick = (id: string) => {
    if (isMobile) {
      // Jika perangkat mobile, toggle visibility tooltip
      setActiveMarker(id === activeMarker ? null : id); // Toggle visibility
    }
  };

  return (
    <>
      {locations.map((location) => (
        <Marker
          key={location.id}
          longitude={Number(location.longitude)}
          latitude={Number(location.latitude)}
          anchor="center"
        >
          <div className="relative group">
            {/* Small marker dot */}
            <div
              className="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
              onClick={() => handleClick(location.id)} // Handle click on mobile
            ></div>

            {/* Tooltip (hover on desktop, click on mobile) */}
            {(isMobile ? activeMarker === location.id : false) || !isMobile ? ( // Show tooltip on click (mobile) or hover (desktop)
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-100 transition-opacity pointer-events-none z-10">
                {location.name}
                {location.distanceKm && (
                  <div className="text-xs opacity-75">
                    {location.distanceKm.toFixed(1)} km
                  </div>
                )}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
              </div>
            ) : null}
          </div>
        </Marker>
      ))}
    </>
  );
};

export default MapMarkers