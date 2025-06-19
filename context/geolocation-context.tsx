"use client"
import { Address } from '@/app/api/location/reverse-geocode/route';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Mendefinisikan tipe untuk state geolocation
interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  address: string
}

// Mendefinisikan tipe untuk context
interface GeolocationContextType {
  location: LocationState;
  getGeolocation: () => void;
}

interface ReverseGeocodeResponse {
  display_name: string;
  address: Address
}
// Membuat context untuk geolocation
const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

// Membuat provider untuk context
interface GeolocationProviderProps {
  children: ReactNode;
}

export const GeolocationProvider: React.FC<GeolocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    address: ""
  });

  const reverseGeocoding = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data: ReverseGeocodeResponse = await response.json();
      if (response.ok) {
        const address = data.address
        setLocation((prev) => ({
          ...prev,
          address: `${address.village} ${address.municipality} ${address.country} ${address.state}`,  // Menggunakan display_name dari API response
        }));
        localStorage.setItem(
          'location',
          JSON.stringify({
            latitude,
            longitude,
            address: `${address.village} ${address.municipality} ${address.country} ${address.state}`,
          })
        );
      }

    } catch (error) {
      setLocation((prev) => ({
        ...prev,
        error: 'Error retrieving address',
      }));
    }
  };

  // Fungsi untuk mendapatkan geolocation
  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude: latitude,
            longitude: longitude,
            error: null,
            address: ""
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
          setLocation({
            latitude: null,
            longitude: null,
            error: err.message,
            address: ""
          });
        }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by this browser.',
        address: ""
      });
    }
  };


  // Cek apakah ada data geolocation yang tersimpan di localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('location');

    if (savedLocation) {
      const parsedLocation = JSON.parse(savedLocation);
      setLocation({
        latitude: parsedLocation.latitude,
        longitude: parsedLocation.longitude,
        error: null,
        address: parsedLocation.address || "",
      });

      // Jika ada data lokasi, lakukan reverse geocoding
      if (parsedLocation.latitude && parsedLocation.longitude) {
        reverseGeocoding(parsedLocation.latitude, parsedLocation.longitude);
      }
    } else {
      // Jika tidak ada data sebelumnya di localStorage, minta geolocation baru
      getGeolocation();
    }
  }, []);

  return (
    <GeolocationContext.Provider value={{ location, getGeolocation }}>
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
