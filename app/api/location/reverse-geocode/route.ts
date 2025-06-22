// app/api/reverse-geocode/route.ts
import { NextResponse } from 'next/server';

interface ReverseGeocodeResponse {
  display_name: string;
  address: Address
}

export interface Address {
  village: string
  municipality: string
  county: string
  state: string
  "ISO3166-2-lvl4": string
  region: string
  "ISO3166-2-lvl3": string
  postcode: string
  country: string
  country_code: string
}
export async function GET(request: Request) {
  // Ambil parameter lat dan lon dari query string
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  // Validasi parameter lat dan lon
  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    // Lakukan request ke OpenStreetMap Nominatim API
    // const response = await fetch(
    //   `${apiUrl}/api/reverse?lat=${lat}&lon=${lon}&format=json`
    // );

    const response = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch address from OpenStreetMap', response: response }, { status: 500 });
    }

    const data: ReverseGeocodeResponse = await response.json();

    // Kirimkan alamat sebagai respons
    return NextResponse.json({ display_name: data.display_name, address: data.address }, { status: 200 });
  } catch (error) {
    console.log(error)
    // Tangani error
    return NextResponse.json({ error: 'gagal mengambil lokasi dari geolocation', code: error }, { status: 500 });
  }
}
