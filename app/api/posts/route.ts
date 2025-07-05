// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk memeriksa sesi user
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        // 1. Verifikasi Sesi User
        const session = await getServerSession(authOptions);
        // Hanya user yang sudah login dan memiliki ID yang valid yang bisa membuat post
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized. Please log in to create a post." }, { status: 401 });
        }

        // 2. Ambil data dari body request
        const {
            eventId, // ID dari event yang terkait dengan postingan ini
            content, // Konten teks postingan
            imageUrl // URL gambar yang sudah diunggah (string tunggal)
        } = await req.json();

        // 3. Validasi Input
        if (!eventId || !content) {
            return NextResponse.json({ message: "Event ID and content are required." }, { status: 400 });
        }
        // Jika ada gambar, pastikan URL-nya tidak kosong
        if (imageUrl !== null && imageUrl === "") {
            return NextResponse.json({ message: "Image URL cannot be empty if provided." }, { status: 400 });
        }

        // 4. Periksa apakah Event yang dituju ada dan sudah disetujui
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId, status:"APPROVED" }, // Pastikan event sudah disetujui
        });

        if (!existingEvent) {
            return NextResponse.json({ message: "Selected event not found or not approved." }, { status: 404 });
        }

        // 5. Buat Postingan Baru di Database
        const newPost = await prisma.eventPost.create({
            data: {
                eventId: eventId, // Kunci asing ke event
                content: content,
                // Asumsi `postedByName` diisi dari data user yang login.
                // Anda bisa memilih antara `fullName` atau `username` sebagai fallback.
                postedByName: session.user.name || "User Terdaftar",
                userId: session.user.id, // Kaitkan postingan dengan user yang membuatnya
                images: {
                    create: {
                        imageUrl: imageUrl
                    }
                }, // Simpan URL gambar tunggal jika ada
            },
            include: {
                user: { // Sertakan informasi user yang membuat postingan dalam respons
                    select: { id: true, fullName: true, email: true, image: true },
                },
                event: { // Sertakan informasi dasar event terkait dalam respons
                    select: { id: true, name: true, startDate: true, endDate: true },
                },
            },
        });

        // 6. Kirim Respons Sukses
        return NextResponse.json(
            { message: "Post created successfully!", post: newPost },
            { status: 201 } // Status 201 Created
        );
    } catch (error) {
        console.error("Error creating post:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: "Failed to create post", error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to create post" }, { status: 500 });
    } finally {
        // Pastikan koneksi database ditutup setelah operasi selesai
        await prisma.$disconnect();
    }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // const status = searchParams.get("status"); // Bisa 'approved', 'pending'
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const whereClause = {};

    // Ambil event dari database
    const posts = await prisma.eventPost.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc", // Urutkan dari yang terbaru
      },
      include: {
        event:{
            select:{
                name: true
            }
        },
        user: {
            select:{
                fullName:true,
                id:true,
                emailVerified:true,
                image:true,
                username:true
            }
        },
        images: {
            select:{
                imageUrl:true
            }
        }, // Sertakan semua gambar event       
      },
    });

    const totalEvents = await prisma.event.count({
      where: whereClause,
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ posts, total: totalEvents });
  } catch (error) {
    console.error("Error listing Posts:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to list Posts", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to list Posts" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}