// app/api/posts/[postId]/like/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

interface PostLikeParams {
    params: Promise<{
        postId: string;
    }>;
}

// GET method: Mengecek apakah user sudah like postingan ini
// Contoh URL: /api/posts/some-post-id/like?userId=some-user-id
export async function GET(req: Request, { params }: PostLikeParams) {
    try {
        const { postId } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId"); // Dapatkan userId dari query param

        if (!postId || !userId) {
            return NextResponse.json({ message: "Post ID and User ID are required." }, { status: 400 });
        }

        const existingLike = await prisma.postLike.findUnique({
            where: {
                postId_userId: { // Menggunakan unique constraint di PostLike schema
                    postId: postId,
                    userId: userId,
                },
            },
        });

        return NextResponse.json({ isLiked: !!existingLike }); // isLiked: true jika ada, false jika tidak
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


// POST method: Melakukan Like pada Postingan
export async function POST(req: Request, { params }: PostLikeParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized. Please log in to like a post." }, { status: 401 });
        }

        const { postId } = await params;

        const existingPost = await prisma.eventPost.findUnique({
            where: { id: postId },
        });
        if (!existingPost) {
            return NextResponse.json({ message: "Post not found." }, { status: 404 });
        }

        try {
            // Coba buat entri PostLike
            await prisma.postLike.create({
                data: {
                    postId: postId,
                    userId: session.user.id,
                },
            });

            // Jika berhasil create PostLike, update likes count di EventPost
            const updatedPost = await prisma.eventPost.update({
                where: { id: postId },
                data: {
                    likes: { increment: 1 } // Tambah 1 like
                }
            });

            return NextResponse.json({ message: "Post liked successfully!", likes: updatedPost.likes });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            // Tangani jika user sudah pernah like (unique constraint violation)
            if (e.code === 'P2002') { // Prisma code for unique constraint violation
                return NextResponse.json({ message: "You have already liked this post." }, { status: 409 }); // Conflict
            }
            throw e; // Lempar error lain jika bukan unique constraint
        }

    } catch (error) {
        console.error("Error liking post:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: "Failed to like post", error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to like post" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// DELETE method: Melakukan Unlike pada Postingan
export async function DELETE(req: Request, { params }: PostLikeParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized. Please log in to unlike a post." }, { status: 401 });
        }

        const { postId } = await params;

        // Coba hapus entri PostLike
        const deleteResult = await prisma.postLike.deleteMany({ // deleteMany karena tidak ada ID unik PostLike di sini
            where: {
                postId: postId,
                userId: session.user.id,
            },
        });

        if (deleteResult.count === 0) {
            // Jika tidak ada PostLike yang dihapus, berarti user belum like atau sudah unlike
            return NextResponse.json({ message: "You have not liked this post or already unliked it." }, { status: 404 });
        }

        // Jika berhasil dihapus, update likes count
        const updatedPost = await prisma.eventPost.update({
            where: { id: postId },
            data: {
                likes: { decrement: 1 } // Kurangi 1 like
            }
        });

        return NextResponse.json({ message: "Post unliked successfully!", likes: updatedPost.likes });

    } catch (error) {
        console.error("Error unliking post:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: "Failed to unlike post", error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to unlike post" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}