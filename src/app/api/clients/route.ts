import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { companies: true }
        });

        const companyId = user?.companies[0]?.id;
        if (!companyId) {
            return NextResponse.json({ error: "No company found" }, { status: 400 });
        }

        const { name, email, phone, notes } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const client = await prisma.client.create({
            data: {
                companyId,
                name,
                email: email || null,
                phone: phone || null,
                notes: notes || null,
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error("Failed to create client", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
