
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PostDetailParams {
    params: Promise<{
        postId: string;
    }>;
}


export async function GET(req: Request,  { params }: PostDetailParams) {
    try {
        const { postId } = await params;

        const existingPost = await prisma.eventPost.findUnique({
            where: { id: postId },
            include: {
                postLike: {
                    select: {
                        userId: true
                    }
                },
                event: {
                    select: {
                        name: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        id: true,
                        emailVerified: true,
                        image: true,
                        username: true
                    }
                },
            },
        })
        if (!existingPost) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(existingPost); // isLiked: true jika ada, false jika tidak
    } catch (error) {
        console.error("Error checking like status:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: "Failed to check like status", error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to check like status" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
