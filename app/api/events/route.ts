// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk memeriksa sesi user
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";
import { calculateDistance } from "@/lib/calculate-distance";

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
      imageUrls, // Array of image URLs for the event
      categoryIds //Array of category IDs 
    } = await req.json();

    // Validasi input
    if (!name || !startDate || !endDate || latitude === undefined || longitude === undefined || !imageUrls || imageUrls.length === 0 || !categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json({ message: "Missing required fields or images/categories." }, { status: 400 });
    }



    // Pastikan tanggal valid
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json({ message: "End date must be after start date" }, { status: 400 });
    }

    // Verifikasi kategori IDs
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (existingCategories.length !== categoryIds.length) {
      return NextResponse.json({ message: "One or more provided category IDs are invalid." }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''); // Buat slug dari nama


    // 4. Buat Event di Database
    const newEvent = await prisma.event.create({
      data: {
        name,
        slug: slug,
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

        eventCategories: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId: categoryId,
          })),
        },
      },
      include: {
        eventCategories: { // Sertakan kategori dalam respons
          include: { category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          } }, // Sertakan detail kategori
        },
        images: true, // Sertakan data gambar yang baru dibuat dalam respons
      },
    });

    // 5. Kirim respons sukses
    return NextResponse.json(
      { message: !!session ?  "Event created successfully!" : "Event created successfully and awaiting admin approval" , event: newEvent },
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



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // 'approved', 'pending'
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get location parameters
    const userLatParam = searchParams.get("lat");
    const userLngParam = searchParams.get("lng");
    const radiusKmParam = searchParams.get("radius"); // Radius in KM (now truly optional)

    // Validate and parse required latitude and longitude if provided for filtering
    const hasLocationParams = userLatParam && userLngParam;
    let userLat: number | null = null;
    let userLng: number | null = null;
    let radiusKm: number | null = null; // Can be null if not provided

    if (hasLocationParams) {
        userLat = parseFloat(userLatParam);
        userLng = parseFloat(userLngParam);
        radiusKm = radiusKmParam ? parseFloat(radiusKmParam) : null; // If radius is not provided, it's null

        if (isNaN(userLat) || isNaN(userLng) || (radiusKm !== null && (isNaN(radiusKm) || radiusKm <= 0))) {
            return NextResponse.json(
                { message: "Invalid latitude, longitude, or radius value." },
                { status: 400 }
            );
        }
    }


    const whereClause: { isApproved?: boolean } = {};
    const session = await getServerSession(authOptions);

    // Filtering logic based on 'status'
    if (status === "pending") {
      if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden: Not authorized to view pending events" }, { status: 403 });
      }
      whereClause.isApproved = false;
    } else {
      whereClause.isApproved = true; // Default: Only show approved events
    }

    // Fetch all events that match the `isApproved` status.
    const allMatchingEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          select: {
            imageUrl: true,
          },
        },
        approvedBy: { select: { id: true, email: true, fullName: true, username: true } },
        eventCategories: { select: { category: { select: { id: true, name: true, slug: true } } } },
      },
    });

    let finalEvents = allMatchingEvents;

    // Apply distance filtering ONLY IF all location parameters (lat, lng, and valid radius) are provided
    if (userLat !== null && userLng !== null && radiusKm !== null) {
      const eventsWithDistance = allMatchingEvents.map(event => {
        let distance = null;
        if (event.latitude !== null && event.longitude !== null) {
          distance = calculateDistance(userLat, userLng, Number(event.latitude), Number(event.longitude));
        }
        return { ...event, distanceKm: distance };
      });

      finalEvents = eventsWithDistance.filter(event => {
        return event.distanceKm !== null && event.distanceKm <= radiusKm;
      });
    } else {
        // If no full location params, but lat/lng were passed, still calculate and return distance
        // but don't filter by radius.
        if (userLat !== null && userLng !== null) {
             finalEvents = allMatchingEvents.map(event => {
                let distance = null;
                if (event.latitude !== null && event.longitude !== null) {
                  distance = calculateDistance(userLat, userLng, Number(event.latitude), Number(event.longitude));
                }
                return { ...event, distanceKm: distance }; // Add distanceKm even if not filtering
            });
        } else {
            // If no lat/lng at all, distanceKm will be null for all events
            finalEvents = allMatchingEvents.map(event => ({ ...event, distanceKm: null }));
        }
    }
    
    // Total count AFTER potential distance filtering
    const totalFilteredEvents = finalEvents.length; 

    // Apply pagination (limit and offset) after all other filtering
    const paginatedEvents = finalEvents.slice(offset, offset + limit);

    // Map categories into the event object for easier frontend consumption
    const eventsForResponse = paginatedEvents.map(event => ({
        ...event,
        categories: event.eventCategories.map(ec => ec.category)
    }));

    return NextResponse.json({ events: eventsForResponse, total: totalFilteredEvents });

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