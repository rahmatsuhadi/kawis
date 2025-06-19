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


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Bisa 'approved', 'pending'
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

     const whereClause: { isApproved?: boolean } = {};
    const session = await getServerSession(authOptions);

    // Logika filter berdasarkan status
    if (status === "pending") {
      // Hanya admin yang bisa melihat event pending
      if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden: Not authorized to view pending events" }, { status: 403 });
      }
      whereClause.isApproved = false;
    } else {
      // Default: Hanya tampilkan event yang sudah disetujui (untuk semua user dan anonim)
      whereClause.isApproved = true;
    }

    // Ambil event dari database
    const events = await prisma.event.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc", // Urutkan dari yang terbaru
      },
      include: {
        images: true, // Sertakan semua gambar event
        posts: false, // Tidak sertakan postingan di sini untuk list
        approvedBy: { // Sertakan informasi admin yang menyetujui (opsional)
          select: { email: true, fullName: true },
        },
      },
    });

    const totalEvents = await prisma.event.count({
      where: whereClause,
    });

    return NextResponse.json({ events, total: totalEvents });
  } catch (error) {
    console.error("Error listing events:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to list events", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to list events" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}