"use client"
import { Address } from '@/app/api/location/reverse-geocode/route';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Mendefinisikan tipe untuk state geolocation
interface LocationState {
  latitude: number;
  longitude: number;
}

// Mendefinisikan tipe untuk context
interface GeolocationContextType {
  location: LocationState | null;
  address: string;
  radius: string;
  setRadius: React.Dispatch<React.SetStateAction<string>>;
  getGeolocation: () => void;
  updateLocation: (newLocation: LocationState) => void;
  isGeolocationAvailable: boolean;
  isPermissionGranted: boolean | null;
  isLoadingLocation: boolean;
}

interface ReverseGeocodeResponse {
  display_name: string;
  address: Address;
}

// Membuat context untuk geolocation
const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

// Membuat provider untuk context
interface GeolocationProviderProps {
  children: ReactNode;
}

let LOCAL_STORAGE_KEY = "user_geo"

export const GeolocationProvider: React.FC<GeolocationProviderProps> = ({ children }) => {

  const [address, setAddress] = useState<string>("");
  const [location, setLocation] = useState<LocationState | null>(null);
  const [radius, setRadius] = useState<string>("5")


  const [isLoadingLocation, setIsLoadingLocation] = useState(true); // True initially for localStorage/GPS check
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false); // Does browser support Geolocation API
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null); // Geolocation permission status


  // Fungsi untuk melakukan reverse geocoding
  const reverseGeocoding = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data: ReverseGeocodeResponse = await response.json();
      if (response.ok) {

        const display_name = data.display_name.split(",");

        const formattedAddress = `${display_name[0]}, ${display_name[1]}, ${display_name[2]}, ${display_name[3]}`;

        return formattedAddress
      }
      return ""
    } catch (error) {
      return ""
    }
  };


  const updateLocation = async (newLocation: LocationState) => {
    setLocation(newLocation);
    const formattedAddress = await reverseGeocoding(newLocation.latitude, newLocation.longitude);
    setAddress(formattedAddress)
    const raw = {
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      address: formattedAddress
    }
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(raw)
    );
  }

  // Fungsi untuk mendapatkan geolocation
  const getGeolocation = () => {

    // Prevent re-fetching if already loading or already have data (unless forced)
    if (isLoadingLocation) {
      return;
    }
    if (location && isPermissionGranted === true) {
      setIsLoadingLocation(false); // Already have location
      return;
    }

    setIsLoadingLocation(true); // Start loading state
    const toastId = toast.loading("Mendapatkan Lokasi anda...", { duration: 0 });


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;


          const addr = await reverseGeocoding(position.coords.latitude, position.coords.longitude);

          setLocation({
            latitude: latitude,
            longitude: longitude,
          });
          setAddress(addr)

          const raw = {
            latitude,
            longitude,
            address: "",
          }
          toast.dismiss(toastId); // Dismiss loading toast
          toast.success("Location successfully obtained!");
          setIsLoadingLocation(false); // Stop loading

          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(raw)
          );
        },
        (err) => {
          setIsPermissionGranted(false); // Permission denied or error occurred
          toast.dismiss(toastId); // Dismiss loading toast
          let errorMessage = "Gagal mendapatkan lokasi.";
          if (err.code === err.PERMISSION_DENIED) { errorMessage = "Perijinan lokasi ditolak."; }
          else if (err.code === err.POSITION_UNAVAILABLE) { errorMessage = "Informasi lokasi tidak tersedia."; }
          else if (err.code === err.TIMEOUT) { errorMessage = "Timed out trying to get location."; }
          toast.error("Lokasi Error", { description: errorMessage });
          setIsLoadingLocation(false); // Stop loading
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setIsGeolocationAvailable(false);
      toast.dismiss(toastId);
      toast.error("Geolocation tidak disupport browser.");
      setIsLoadingLocation(false); // Stop loading
    }
  };

  useEffect(() => {
    setIsGeolocationAvailable(typeof window !== "undefined" && "geolocation" in navigator);

    const savedLocation = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsedLocation = JSON.parse(savedLocation || "{}");



    if (!parsedLocation && typeof window !== "undefined" && "geolocation" in navigator) {
      // If not loaded from storage, and geolocation is available in browser,
      // then query permission status and attempt to get location.
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setIsPermissionGranted(result.state === 'granted' ? true : result.state === 'denied' ? false : null);
        if (result.state === 'granted') {
          getGeolocation(); // Get location if already granted
        } else {
          setIsLoadingLocation(false); // If not granted/denied, stop initial loading
        }
        // Monitor permission changes after initial query
        result.onchange = () => {
          setIsPermissionGranted(result.state === 'granted');
          if (result.state === 'granted') {
            getGeolocation();
          }
        };
      }).catch(error => {
        // Error querying permission API itself (e.g., browser doesn't support query API)
        console.error("Error querying geolocation permission on init:", error);
        setIsGeolocationAvailable(false); // Assume not available if query fails
        setIsLoadingLocation(false);
      });
    } else {
      // If loaded from localStorage, or if geolocation not available in browser,
      console.log(parsedLocation)
      // then initial loading is complete.
      setLocation({
        latitude: parsedLocation.latitude,
        longitude: parsedLocation.longitude
      });
      setAddress(parsedLocation?.address || "");

      setIsLoadingLocation(false);
    }
  }, []); // Dependencies


  // useEffect(() => {
  //   const savedLocation = localStorage.getItem('location');
  //   if (savedLocation) {
  //     const parsedLocation = JSON.parse(savedLocation);

  //   }
  // }, [])

  return (
    <GeolocationContext.Provider value={{ location, updateLocation, setRadius, radius, address, getGeolocation, isLoadingLocation, isGeolocationAvailable, isPermissionGranted }}>
      {children}
    </GeolocationContext.Provider>
  );
};

// Hook untuk menggunakan GeolocationContext
export const useGeolocation = (): GeolocationContextType => {
  const context = React.useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};
