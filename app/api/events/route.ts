// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk memeriksa sesi user
import { EventStatus, Prisma, PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";
import { calculateDistance } from "@/lib/calculate-distance";

const prisma = new PrismaClient();


export async function POST(req: Request) {
  try {
    // 1. Verifikasi Sesi User
    const session = await getServerSession(authOptions);
    // Jika Anda ingin hanya user terotentikasi yang bisa membuat event, uncomment ini
    // if (!session) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // 2. Ambil data dari body request
    const body = await req.json();
    const {
      name,
      description,
      startDate, // ISO String dari Frontend (e.g., "2025-07-10T00:00:00.000Z")
      endDate,   // ISO String dari Frontend
      address,
      location, // Ini adalah field 'location' di schema Anda (nama lokasi)
      latitude, // Number
      longitude, // Number
      price, // String dari frontend, e.g., "100000" atau "Free"
      isPaid, // Boolean
      anonymousName, // String
      organizerName, // String?
      imageUrls, // Array of string URLs
      categoryIds // Array of category IDs
    } = body;

    // 3. Validasi Input Dasar
    // Pastikan semua field wajib ada
    if (
      !name ||
      !description || // Description dijadikan wajib di sini untuk kualitas data
      !startDate ||
      !endDate ||
      !address ||
      !location ||
      latitude === undefined || // Menggunakan '=== undefined' untuk memastikan angka 0 juga diterima
      longitude === undefined ||
      !anonymousName || // Sesuai skema Anda yang anonymousName tidak nullable
      !imageUrls || imageUrls.length === 0 || // Harus ada gambar
      !categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0 // Harus ada kategori
    ) {
      return NextResponse.json(
        { message: "Missing required fields. Please provide name, description, start/end date, address, location, coordinates, anonymous name, images, and categories." },
        { status: 400 }
      );
    }

    // Validasi Tanggal
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return NextResponse.json({ message: "Invalid start or end date format." }, { status: 400 });
    }

    if (parsedStartDate >= parsedEndDate) {
      return NextResponse.json({ message: "End date must be after start date." }, { status: 400 });
    }

    // Validasi Harga
    let finalPrice:string  = "0.00"; // Default jika isPaid false atau tidak ada harga
    if (isPaid) {
      // Jika isPaid true, harga harus numerik dan valid
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ message: "Invalid price for a paid event." }, { status: 400 });
      }
      finalPrice = parsedPrice.toFixed(2); // Format harga ke 2 desimal
    } else {
      // Jika tidak berbayar, pastikan harga yang dikirim adalah "Free" atau bisa diabaikan
      // Jika price dikirim dan isPaid false, pastikan price adalah "Free"
      if (price && price !== "Free") {
        return NextResponse.json({ message: "Price must be 'Free' for a free event, or set isPaid to true." }, { status: 400 });
      }
    }


    // 4. Verifikasi Category IDs
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true }, // Hanya ambil ID untuk verifikasi
    });

    if (existingCategories.length !== categoryIds.length) {
      // Temukan ID yang tidak valid untuk pesan error yang lebih spesifik
      const validCategoryIds = new Set(existingCategories.map(cat => cat.id));
      const invalidCategoryIds = categoryIds.filter((id: string) => !validCategoryIds.has(id));
      return NextResponse.json(
        { message: `One or more provided category IDs are invalid: ${invalidCategoryIds.join(', ')}.` },
        { status: 400 }
      );
    }

    // 5. Buat Slug dari Nama Event
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;
    // Cek apakah slug sudah ada, jika ya tambahkan suffix angka
    while (await prisma.event.findUnique({ where: { slug: slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 6. Buat Event di Database
    const newEvent = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        address,
        location, // Menggunakan field 'location' sesuai schema Anda
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        latitude: latitude, // Konversi Number ke Prisma.Decimal
        longitude: longitude, // Konversi Number ke Prisma.Decimal
        price: finalPrice, // Menggunakan finalPrice yang sudah divalidasi dan diformat
        isPaid,
        tags: body.tags || [], // Pastikan tags adalah array string, default ke array kosong jika tidak ada
        organizerName: organizerName || session?.user?.name || anonymousName, // Prioritaskan organizerName, lalu user session, lalu anonymousName
        anonymousName: anonymousName, // Sesuai skema Anda yang anonymousName tidak nullable

        status: session?.user.role === "ADMIN" ? "APPROVED" : "PENDING", // Auto-approve jika dibuat admin, selain itu PENDING

        images: imageUrls, // Sesuaikan ini jika model EventImage terpisah (saat ini String[])

        // Menghubungkan event dengan user pembuat jika ada sesi
        createdBy: session?.user?.id ? { connect: { id: session.user.id } } : undefined,
        approvedBy: session?.user.role === "ADMIN" && session?.user?.id ? { connect: { id: session.user.id } } : undefined,


        // Membuat koneksi ke kategori menggunakan tabel perantara EventCategory
        eventCategories: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId: categoryId,
          })),
        },
      },
      include: {
        eventCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        // Anda mungkin ingin meng-include field lain seperti createdBy atau approvedBy
        // createdBy: true,
        // approvedBy: true,
      },
    });

    // 7. Kirim Respons Sukses
    const successMessage = session?.user.role === "ADMIN"
      ? "Event created and approved successfully!"
      : "Event created successfully and awaiting admin approval.";

    return NextResponse.json(
      { message: successMessage, event: newEvent },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating event:", error);
    // Lebih baik memeriksa jenis error tertentu dari Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // E.g., P2002: unique constraint failed (misal slug duplikat tanpa counter)
      if (error.code === 'P2002') {
        return NextResponse.json(
          { message: "A unique constraint failed. This might be a duplicate slug or other unique field issue.", error: error.message },
          { status: 409 } // Conflict
        );
      }
      return NextResponse.json(
        { message: "Database error occurred.", error: error.message },
        { status: 500 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to create event", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  } finally {
    // Pastikan koneksi Prisma terputus setelah operasi selesai
    // Ini penting jika Anda menggunakan instance PrismaClient non-singleton
    // Jika Anda menggunakan singleton (recommended), ini mungkin tidak perlu di setiap request
    await prisma.$disconnect();
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const approvalStatusParam = searchParams.get("status"); // 'approved', 'pending', 'rejected'
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const userLatParam = searchParams.get("lat");
    const userLngParam = searchParams.get("lng");
    const radiusKmParam = searchParams.get("radius");
    const categoriesParam = searchParams.get("categories");
    const searchTerm = searchParams.get("q"); // Search query parameter
    const priceFilterParam = searchParams.get("priceFilter"); // 'free', 'paid'

    // Determine if location parameters are available for filtering/distance calculation
    const hasLocationParamsForDistanceCalc = userLatParam && userLngParam;
    let userLat: number | null = null;
    let userLng: number | null = null;
    let radiusKm: number | null = null;

    if (hasLocationParamsForDistanceCalc) {
      userLat = parseFloat(userLatParam!);
      userLng = parseFloat(userLngParam!);
      radiusKm = radiusKmParam ? parseFloat(radiusKmParam) : null; // Radius is optional here

      if (isNaN(userLat) || isNaN(userLng) || (radiusKm !== null && (isNaN(radiusKm) || radiusKm <= 0))) {
        return NextResponse.json(
          { message: "Invalid latitude, longitude, or radius value. Must be valid numbers and radius > 0." },
          { status: 400 }
        );
      }
    }


    const whereClause: Prisma.EventWhereInput = {};
    const session = await getServerSession(authOptions);

    // 1. Filter by Approval Status (`status` enum)
    if (approvalStatusParam === "pending") {
      if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden: Not authorized to view pending events." }, { status: 403 });
      }
      whereClause.status = EventStatus.PENDING; // Use enum value
    } else if (approvalStatusParam === "rejected") {
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden: Not authorized to view rejected events." }, { status: 403 });
        }
        whereClause.status = EventStatus.REJECTED; // Use enum value
    } else {
      if(!session || session.user?.role !== "ADMIN"){
        whereClause.status = EventStatus.APPROVED; // Default: Only show APPROVED events
      }
    }

    // 2. Default Temporal Filter: startDate >= today (for public/approved events)
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // Apply this date filter if the status is APPROVED (i.e., for public view)
    if (whereClause.status === EventStatus.APPROVED) {
      whereClause.startDate = { gte: today }; 
    }

    // 3. Filter by Categories
    if (categoriesParam) {
        const categoryIds = categoriesParam.split(',');
        if (categoryIds.length > 0) {
            whereClause.eventCategories = {
                some: {
                    categoryId: {
                        in: categoryIds
                    }
                }
            };
        }
    }

    // 4. Filter by Search Term ('q')
    if (searchTerm) {
      // For string fields like name, description, address, organizerName
      const searchConditions = [
        { name: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
        { address: { contains: searchTerm, mode: 'insensitive' as const } },
        { organizerName: { contains: searchTerm, mode: 'insensitive' as const } },
      ];
      // Add these conditions to the existing whereClause with an OR operator
      // If whereClause already has `OR`, combine them. Otherwise, create a new `OR`.
      if (whereClause.OR) {
        whereClause.OR.push(...searchConditions);
      } else {
        whereClause.OR = searchConditions;
      }
    }

    // 5. Filter by Price ('priceFilter')
    if (priceFilterParam) {
        if (priceFilterParam === "free") {
            whereClause.price = { equals: 0 };
        } else if (priceFilterParam === "paid") {
            whereClause.price = { gt: 0 };
        }
    }



    const allMatchingEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy:{
          select:{
            image:true,
            name:true,
          }
        },
        approvedBy: { select: { id: true, email: true, name: true, username: true } },
        eventCategories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        // If you have `tags` in your Event model, include them here:
        // eventTags: { include: { tag: true } },
      },
    });

    let finalEvents = allMatchingEvents;

    // Apply distance filtering (remains the same)
    if (hasLocationParamsForDistanceCalc && userLat !== null && userLng !== null && radiusKm !== null) {
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
    } else if (hasLocationParamsForDistanceCalc && userLat !== null && userLng !== null) {
        // Calculate distance even if no radius filter, for frontend display
        finalEvents = allMatchingEvents.map(event => {
            let distance = null;
            if (event.latitude !== null && event.longitude !== null) {
              distance = calculateDistance(userLat, userLng, Number(event.latitude), Number(event.longitude));
            }
            return { ...event, distanceKm: distance };
        });
    } else {
        // If no lat/lng at all, distanceKm will be null for all events
        finalEvents = allMatchingEvents.map(event => ({ ...event, distanceKm: null }));
    }
    
    const totalFilteredEvents = finalEvents.length; 
    const paginatedEvents = finalEvents.slice(offset, offset + limit);

    const eventsForResponse = paginatedEvents.map(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      let currentTemporalStatus: "upcoming" | "ongoing" | "ended" | "unknown" = "unknown";
      const currentMoment = new Date();

      if (currentMoment < startDate) {
        currentTemporalStatus = "upcoming";
      } else if (currentMoment >= startDate && currentMoment <= endDate) {
        currentTemporalStatus = "ongoing";
      } else if (currentMoment > endDate) {
        currentTemporalStatus = "ended";
      }

      return {
        ...event,
        categories: event.eventCategories.map((ec) => ec.category), // Still using `any` here, can be refined with more specific types
        temporalStatus: currentTemporalStatus, // Computed status for frontend display
        // If you have tags, map them here (assuming `eventTags` is included):
        // tags: event.eventTags.map((et: any) => et.tag), 
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

