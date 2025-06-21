// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk memeriksa sesi user
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Verifikasi Sesi User
    const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // 2. Ambil data dari body request
    const {
      name,
      description,
      startDate,
      address,
      endDate,
      latitude,
      longitude,
      anonymousName, // Meskipun event dibuat user login, bisa jadi ada field ini untuk anonim
      // Misalnya, jika event dibuat oleh user tapi ingin ditampilkan seperti anonim
      // Atau, kita bisa hilangkan ini jika event yang dibuat user login selalu menggunakan nama user tersebut
      imageUrls // Array of image URLs for the event
    } = await req.json();

    // 3. Validasi input
    if (!name || !startDate || !endDate || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Pastikan tanggal valid
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json({ message: "End date must be after start date" }, { status: 400 });
    }

    // 4. Buat Event di Database
    const newEvent = await prisma.event.create({
      data: {
        name,
        address,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        latitude,
        longitude,
        // Jika event selalu dibuat oleh user login, anonymousName bisa diisi dari username/fullName user
        // Atau, jika anonymousName hanya untuk event anonim, bisa dihilangkan di sini atau dikosongkan.
        // Untuk saat ini, kita asumsikan anonymousName tetap bisa dikirim
        anonymousName: !!session ? session.user.name : anonymousName, // Fallback jika anonim tidak diisi
        isApproved: !!session, // Event yang baru dibuat selalu perlu diapprove admin
        // Jika Anda ingin event yang dibuat ADMIN langsung approved, tambahkan logika di sini
        // approvedById: (session.user.role === "ADMIN") ? session.user.id : null,        
        // Handle multiple images
        images: {
          create: imageUrls ? imageUrls.map((url: string) => ({ imageUrl: url })) : [],
        },
      },
      include: {
        images: true, // Sertakan data gambar yang baru dibuat dalam respons
      },
    });

    // 5. Kirim respons sukses
    return NextResponse.json(
      { message: "Event created successfully and awaiting admin approval", event: newEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to create event", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to create event" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam kilometer
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // 'approved', 'pending'
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get location parameters (using 'lat' and 'lng')
    const userLatParam = searchParams.get("lat");
    const userLngParam = searchParams.get("lng");
    const radiusKmParam = searchParams.get("radius"); // Radius in KM

    // Validate and parse required latitude and longitude
    if (!userLatParam || !userLngParam) {
      return NextResponse.json(
        { message: "Latitude (lat) and longitude (lng) are required parameters for location-based search." },
        { status: 400 }
      );
    }

    const userLat = parseFloat(userLatParam);
    const userLng = parseFloat(userLngParam);

    // Parse optional radius, default to 5 KM
    const radiusKm = radiusKmParam ? parseFloat(radiusKmParam) : 5;

    // Validate parsed numeric parameters
    if (isNaN(userLat) || isNaN(userLng) || isNaN(radiusKm) || radiusKm <= 0) {
      return NextResponse.json(
        { message: "Invalid latitude, longitude, or radius value. Must be valid numbers and radius > 0." },
        { status: 400 }
      );
    }

    const whereClause: { isApproved?: boolean } = {};
    const session = await getServerSession(authOptions);

    // Filtering logic based on 'status'
    if (status === "pending") {
      // Only admins can view pending events
      if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden: Not authorized to view pending events" }, { status: 403 });
      }
      whereClause.isApproved = false;
    } else {
      // Default: Only show approved events (for all users and anonymous)
      whereClause.isApproved = true;
    }

    // Fetch all events that match the `isApproved` status first.
    // Distance filtering and pagination will be applied in memory afterwards.
    const allMatchingEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc", // Order by most recent
      },
      include: {
        images: true, // Include all event images
        approvedBy: { // Include information of the approving admin (optional)
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    // Calculate distance for each event and filter based on radius
    const eventsWithDistance = allMatchingEvents.map(event => {
      let distance = null;
      // Only calculate distance if the event itself has valid coordinates
      if (event.latitude !== null && event.longitude !== null) {
        distance = calculateDistance(userLat, userLng, Number(event.latitude), Number(event.longitude));
      }
      return { ...event, distanceKm: distance }; // Add the distanceKm property
    });

    const filteredEventsByDistance = eventsWithDistance.filter(event => {
      // Only include events that have a calculated distance and are within the specified radius
      return event.distanceKm !== null && event.distanceKm <= radiusKm;
    });

    // Apply pagination (limit and offset) after distance filtering
    const paginatedEvents = filteredEventsByDistance.slice(offset, offset + limit);
    const totalFilteredEvents = filteredEventsByDistance.length; // Total count AFTER distance filtering

    return NextResponse.json({ events: paginatedEvents, total: totalFilteredEvents });

  } catch (error) {
    console.error("Error listing events:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Failed to list events: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to list events" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}