
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk memeriksa sesi user
import {  Prisma, PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";
import { calculateDistance } from "@/lib/calculate-distance";

const prisma = new PrismaClient();


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
    const categoriesParam = searchParams.get("categories"); // Radius in KM (now truly optional)
    // const statusParam = searchParams.get("status"); // Radius in KM (now truly optional)

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


    const whereClause: Prisma.EventWhereInput = {};
    const session = await getServerSession(authOptions);

    // Filtering logic based on 'status'
    if (status === "pending") {
      if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden: Not authorized to view pending events" }, { status: 403 });
      }
      whereClause.status = "PENDING";
    } else {
      whereClause.status = "APPROVED"; // Default: Only show approved events
    }


    // --- Perubahan Kunci: Default Filter Temporal `startDate >= hari ini` ---
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Atur ke awal hari ini
    whereClause.startDate = { gte: now }; // Hanya event yang dimulai hari ini atau nanti

    // --- NEW: Filter by Categories ---
    if (categoriesParam) {
      const categoryIds = categoriesParam.split(','); // Split comma-separated IDs into an array
      if (categoryIds.length > 0) {
        whereClause.eventCategories = {
          some: { // 'some' means that at least one related category matches
            categoryId: {
              in: categoryIds // Filter events that are linked to any of these category IDs
            }
          }
        };
      }
    }


    // Fetch all events that match the `isApproved` status.
    const allMatchingEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        approvedBy: { select: { id: true, email: true, name: true, username: true } },
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



    const eventsForResponse = paginatedEvents.map(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      let status: "coming" | "ongoing" | "ended" = "coming";

      if (now < startDate) {
        status = "coming";
      } else if (now >= startDate && now <= endDate) {
        status = "ongoing";
      } else if (now > endDate) {
        status = "ended";
      }

      return {
        ...event,
        categories: event.eventCategories.map(ec => ec.category),
        status, // <= Tambahkan status di sini
      };
    });



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

