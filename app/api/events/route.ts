// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk memeriksa sesi user
import { EventStatus, PrismaClient } from "@prisma/client";
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
        status: "PENDING",
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
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }, // Sertakan detail kategori
        },
        images: true, // Sertakan data gambar yang baru dibuat dalam respons
      },
    });

    // 5. Kirim respons sukses
    return NextResponse.json(
      { message: !!session ? "Event created successfully!" : "Event created successfully and awaiting admin approval", event: newEvent },
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
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const whereClause: { status?: EventStatus } = {};
    const session = await getServerSession(authOptions);

    // Filtering logic based on 'status'
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Not authorized to view events" }, { status: 403 });
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


    // Total count AFTER potential distance filtering
    const totalFilteredEvents = allMatchingEvents.length;

    // Apply pagination (limit and offset) after all other filtering
    const paginatedEvents = allMatchingEvents.slice(offset, offset + limit);

    // const now = new Date();

    const eventsForResponse = paginatedEvents.map(event => {
      // const startDate = new Date(event.startDate);
      // const endDate = new Date(event.endDate);

      // let status: "coming" | "ongoing" | "ended" = "coming";

      // if (now < startDate) {
      //   status = "coming";
      // } else if (now >= startDate && now <= endDate) {
      //   status = "ongoing";
      // } else if (now > endDate) {
      //   status = "ended";
      // }

      return {
        ...event,
        categories: event.eventCategories.map(ec => ec.category),
        // status, // <= Tambahkan status di sini
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

