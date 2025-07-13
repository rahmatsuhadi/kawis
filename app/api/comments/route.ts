// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// GET method: Mendapatkan daftar komentar untuk sebuah postingan
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      orderBy: { createdAt: "asc" }, // Urutkan dari yang terlama (kronologis)
      include: {
        user: { select: { id: true, name: true, username: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to fetch comments", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to fetch comments" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST method: Membuat komentar baru
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized. Please log in to comment." }, { status: 401 });
    }

    const { postId, content } = await req.json();

    if (!postId || !content || content.trim() === "") {
      return NextResponse.json({ message: "Post ID and comment content are required." }, { status: 400 });
    }

    const existingPost = await prisma.eventPost.findUnique({
      where: { id: postId },
    });
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId: postId,
        content: content,
        userId: session.user.id, // User yang membuat komentar
      },
      include: {
        user: { select: { id: true, name: true, username: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ message: "Comment added successfully!", comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to add comment", error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Failed to add comment" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}