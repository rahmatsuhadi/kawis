"use client"
import { Address } from '@/app/api/location/reverse-geocode/route';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

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

export const GeolocationProvider: React.FC<GeolocationProviderProps> = ({ children }) => {

  const [address, setAddress] = useState<string>("");
  const [location, setLocation] = useState<LocationState | null>(null);
  const [radius, setRadius] = useState<string>("5")

  // Fungsi untuk melakukan reverse geocoding
  const reverseGeocoding = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `/api/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data: ReverseGeocodeResponse = await response.json();
      if (response.ok) {

        const display_name = data.display_name.split(",");

        const formattedAddress = `${display_name[0]}, ${display_name[1]}, ${display_name[2]}, ${display_name[3]}`;

        setAddress(formattedAddress);
        localStorage.setItem(
          'location',
          JSON.stringify({
            latitude,
            longitude,
            address: formattedAddress,
          })
        );
      }
    } catch (error) {
      setAddress("");
    }
  };


  const  updateLocation = async(newLocation: LocationState) => {
    setLocation(newLocation);
   await reverseGeocoding(newLocation.latitude, newLocation.longitude);
  }

  // Fungsi untuk mendapatkan geolocation
  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude: latitude,
            longitude: longitude,
          });
          localStorage.setItem(
            'location',
            JSON.stringify({
              latitude,
              longitude,
              address: "",
            })
          );
          reverseGeocoding(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setLocation(null);
    }
  };



  useEffect(() => {
    const savedLocation = localStorage.getItem('location');
    if (savedLocation) {
      const parsedLocation = JSON.parse(savedLocation);

      setLocation({
        latitude: parsedLocation.latitude,
        longitude: parsedLocation.longitude
      });
      setAddress(parsedLocation?.address || "");
    }
  }, [])

  return (
    <GeolocationContext.Provider value={{ location,updateLocation, setRadius, radius, address, getGeolocation }}>
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
