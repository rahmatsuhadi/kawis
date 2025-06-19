// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Definisikan tipe untuk params agar TypeScript aman
interface EventDetailParams {
  params: Promise<{
    id: string; // ID event akan menjadi string
  }>
}

export async function GET(req: Request, { params }: EventDetailParams) {
  try {
    const { id } = await params; // Ambil ID event dari params URL

    // 1. Validasi ID
    if (!id) {
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
    }

    // 2. Cari Event di Database
    const event = await prisma.event.findUnique({
      where: {
        id: id,
        isApproved: true, // Hanya tampilkan event yang sudah disetujui
      },
      include: {
        images: true, // Sertakan semua gambar terkait event
        posts: { // Sertakan postingan terkait event (opsional, bisa dibatasi jumlahnya)
          take: 4,
          include: {
            user: { // Sertakan informasi user yang membuat postingan
              select: { id: true, fullName: true, email: true, image: true },
            },
            images: true, // Sertakan gambar postingan juga
          },
          orderBy: {
            createdAt: "desc", // Urutkan postingan terbaru di atas
          },
        },
        approvedBy: { // Sertakan informasi admin yang menyetujui event
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // 3. Tangani Jika Event Tidak Ditemukan
    if (!event) {
      return NextResponse.json({ message: "Event not found or not approved" }, { status: 404 });
    }

    // 4. Kirim Respons Sukses
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event details:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to fetch event details", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to fetch event details" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}