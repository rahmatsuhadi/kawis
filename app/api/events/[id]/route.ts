// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

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
    const event = await prisma.event.findFirst({
      where: {
        OR:[{
          id: id,
        },{
          slug: id
        }],
        status: "APPROVED"// Hanya tampilkan event yang sudah disetujui
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
        eventCategories: { // <-- Sertakan kategori dalam respons
          include: { category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          } }, // Sertakan detail kategori dari tabel Category
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


// --- BARIS BARU: PATCH METHOD UNTUK UPDATE EVENT ---
export async function PATCH(req: Request, { params }: EventDetailParams) {
  try {
    const { id } = await params; // Ambil ID event dari URL

    // 1. Verifikasi Autentikasi & Otorisasi
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    // Hanya izinkan ADMIN untuk mengupdate event
    // Atau, jika user pembuat event juga bisa mengupdate, tambahkan logika di sini
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Hanya ADMIN yang dapat mengupdate event ini." }, { status: 403 });
    }

    // 2. Ambil Data dari Body Request (JSON)
    const body = await req.json();

    // Buat objek untuk data yang akan diupdate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: { [key: string]: any } = {};

    // Ambil event saat ini untuk validasi dan referensi
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { eventCategories: true } // Sertakan kategori untuk cek perubahan
    });

    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    // --- Pemrosesan Field yang Bisa Diupdate ---
    // Contoh: `name`
    if (body.name !== undefined && body.name !== existingEvent.name) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        
        return NextResponse.json({ message: "Event name must be a non-empty string." }, { status: 400 });
      }
      updateData.name = body.name.trim();
      // Jika nama berubah, slug juga mungkin perlu diupdate
      updateData.slug = body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Contoh: `description`
    if (body.description !== undefined && body.description !== existingEvent.description) {
      if (typeof body.description !== 'string') {
        return NextResponse.json({ message: "Description must be a string." }, { status: 400 });
      }
      updateData.description = body.description;
    }

    // Contoh: `startDate`, `endDate`
    if (body.startDate !== undefined && body.endDate !== undefined) {
      const newStartDate = new Date(body.startDate);
      const newEndDate = new Date(body.endDate);

      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime()) || newStartDate >= newEndDate) {
        return NextResponse.json({ message: "Invalid date format or end date is not after start date." }, { status: 400 });
      }
      updateData.startDate = newStartDate;
      updateData.endDate = newEndDate;
    } else if (body.startDate !== undefined || body.endDate !== undefined) {
        // Jika hanya salah satu tanggal yang diupdate, ini bisa jadi error atau butuh logika kompleks
        return NextResponse.json({ message: "Both startDate and endDate must be provided if either is updated." }, { status: 400 });
    }

    // Contoh: `latitude`, `longitude`
    if (body.latitude !== undefined && body.longitude !== undefined) {
        const newLatitude = parseFloat(body.latitude);
        const newLongitude = parseFloat(body.longitude);
        if (isNaN(newLatitude) || isNaN(newLongitude) || newLatitude < -90 || newLatitude > 90 || newLongitude < -180 || newLongitude > 180) {
            return NextResponse.json({ message: "Invalid latitude or longitude format/range." }, { status: 400 });
        }
        updateData.latitude = newLatitude;
        updateData.longitude = newLongitude;
    } else if (body.latitude !== undefined || body.longitude !== undefined) {
        return NextResponse.json({ message: "Both latitude and longitude must be provided if either is updated." }, { status: 400 });
    }

    // Contoh: `address`
    if (body.address !== undefined && body.address !== existingEvent.address) {
        if (typeof body.address !== 'string' || body.address.trim() === '') {
            return NextResponse.json({ message: "Address must be a non-empty string." }, { status: 400 });
        }
        updateData.address = body.address.trim();
    }

    // Contoh: `anonymousName`
    if (body.anonymousName !== undefined && body.anonymousName !== existingEvent.anonymousName) {
        if (typeof body.anonymousName !== 'string') {
            return NextResponse.json({ message: "Anonymous name must be a string." }, { status: 400 });
        }
        updateData.anonymousName = body.anonymousName.trim();
    }

    // Contoh: `organizerName`
    if (body.organizerName !== undefined && body.organizerName !== existingEvent.organizerName) {
        if (typeof body.organizerName !== 'string' || body.organizerName.trim() === '') {
            return NextResponse.json({ message: "Organizer name must be a non-empty string." }, { status: 400 });
        }
        updateData.organizerName = body.organizerName.trim();
    }

   // Update `status` Event baru (PENDING, APPROVED, REJECTED)
    if (body.status !== undefined && typeof body.status === 'string') {
        const newStatus = body.status.toUpperCase();
        // Memastikan nilai status valid sesuai enum Prisma
        if (!["PENDING", "APPROVED", "REJECTED"].includes(newStatus)) {
            return NextResponse.json({ message: "Status event tidak valid. Harus PENDING, APPROVED, atau REJECTED." }, { status: 400 });
        }
        if (newStatus !== existingEvent.status) {
            updateData.status = newStatus;
            // Jika disetujui, catat admin yang menyetujui
            if (newStatus === "APPROVED") {
                updateData.approvedById = session.user.id;
            } else if (newStatus === "PENDING" || newStatus === "REJECTED") {
                // Hapus penanda persetujuan jika diubah kembali ke PENDING/REJECTED
                updateData.approvedById = null;
            }
        }
    }

    // Cek apakah ada data yang perlu diupdate
    if (Object.keys(updateData).length === 0 && (!body.categoryIds || body.categoryIds.length === existingEvent.eventCategories.length)) {
        // Cek juga apakah categoryIds yang dikirim sama persis dengan yang sudah ada (untuk mencegah update kosong)
        const currentCategoryIds = existingEvent.eventCategories.map(ec => ec.categoryId).sort();
        const incomingCategoryIds = (body.categoryIds || []).sort();
        if (JSON.stringify(currentCategoryIds) === JSON.stringify(incomingCategoryIds)) {
            return NextResponse.json({ message: "No data provided for update or no changes detected." }, { status: 200 });
        }
    }


    // 3. Update Event di Database
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { // Sertakan relasi yang relevan dalam respons
        images: true,
        eventCategories: { include: { category: true } },
        approvedBy: { select: { id: true, username: true, fullName: true, email: true } },
      },
    });

    // 4. Kirim Respons Sukses
    return NextResponse.json({ message: "Event updated successfully!", event: updatedEvent });

  } catch (error) {
    console.error("Error updating event:", error);
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed") && error.message.includes("slug")) {
          return NextResponse.json({ message: "Event name (slug) already exists." }, { status: 409 });
      }
      return NextResponse.json({ message: `Failed to update event: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to update event" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}