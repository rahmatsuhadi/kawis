// app/api/categories/[id]/route.ts (File baru)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

interface CategoryParams {
  params: Promise<{ id: string }>;
}

// PUT method: Memperbarui kategori (Hanya Admin)
export async function PUT(req: Request, { params }: CategoryParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only admins can update categories." }, { status: 403 });
    }

    const { id } = await params;
    const { name } = await req.json();

    if (!id || !name || name.trim() === "") {
      return NextResponse.json({ message: "Category ID and name are required." }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Periksa apakah ID kategori ada
    const existingCategory = await prisma.category.findUnique({ where: { id: id } });
    if (!existingCategory) {
      return NextResponse.json({ message: "Category not found." }, { status: 404 });
    }

    // Periksa konflik slug/nama dengan kategori lain
    const conflictCategory = await prisma.category.findFirst({
      where: { OR: [{ name: name }, { slug: slug }], NOT: { id: id } },
    });
    if (conflictCategory) {
      return NextResponse.json({ message: "Category with this name or slug already exists." }, { status: 409 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: { name, slug, updatedAt: new Date() },
    });

    return NextResponse.json({ message: "Category updated successfully!", category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to update category", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: Request, { params }: CategoryParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only admins can delete categories." }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Category ID is required." }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({ where: { id: id } });
    if (!existingCategory) {
      return NextResponse.json({ message: "Category not found." }, { status: 404 });
    }

    // Hapus kategori. Prisma akan otomatis menangani EventCategory yang terkait (Cascade Delete)
    const deletedCategory = await prisma.category.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Category deleted successfully!", category: deletedCategory });
  } catch (error) {
    console.error("Error deleting category:", error);
    // Tangani jika ada relasi (event masih terhubung), Prisma akan melempar P2003 Foreign key constraint failed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (error instanceof Error && (error as any).code === 'P2003') {
        return NextResponse.json({ message: "Failed to delete category: It is still linked to events." }, { status: 409 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to delete category", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}