// app/api/categories/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Untuk otorisasi admin
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// GET method: Mendapatkan daftar semua kategori
// Bisa diakses publik jika Anda ingin menampilkan daftar kategori di frontend
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" }, // Urutkan berdasarkan nama
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });
        return NextResponse.json(categories);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: "Failed to fetch categories", error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// POST method: Membuat kategori baru (Hanya Admin)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Hanya admin yang bisa membuat kategori
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden: Only admins can create categories." }, { status: 403 });
        }

        const { name } = await req.json();

        if (!name || name.trim() === "") {
            return NextResponse.json({ message: "Category name is required." }, { status: 400 });
        }

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''); // Buat slug dari nama



        // Periksa apakah kategori dengan nama/slug yang sama sudah ada
        const existingCategory = await prisma.category.findFirst({
            where: {
                OR: [
                    { name: name }, { slug: slug }]
            },
        });
        if (existingCategory) {
            return NextResponse.json({ message: "Category with this name or slug already exists." }, { status: 409 });
        }

        const newCategory = await prisma.category.create({
            data: { name, slug },
            select:{
                id: true,
                name: true,
                slug: true,
            }
        });

        return NextResponse.json({ message: "Category created successfully!", category: newCategory }, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: "Failed to create category", error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}