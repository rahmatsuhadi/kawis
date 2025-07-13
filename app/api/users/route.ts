import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const roleFilter = searchParams.get("role");

        const whereClause: { role?: UserRole } = {};

        if(roleFilter){
            whereClause.role = roleFilter as UserRole;
        }


        const session = await getServerSession(authOptions);

        // Filtering logic based on 'status'
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Not authorized to view events" }, { status: 403 });
        }

        // Fetch all events that match the `isApproved` status.
        const allUsers = await prisma.user.findMany({
            where: whereClause,
            take: limit,
            skip: offset,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        eventPosts: true,
                        approvedEvents: true
                    },
                },
                accounts: {
                    select: {
                        provider: true
                    }
                }
            },
        });

        const totalFiltereduser = await prisma.user.count({
            // take: limit,
            // skip: offset,
            // where: whereClause,
        })

        return NextResponse.json({ users: allUsers, total: totalFiltereduser });

    } catch (error) {
        console.error("Error listing users:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: `Failed to list users: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to list users" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
