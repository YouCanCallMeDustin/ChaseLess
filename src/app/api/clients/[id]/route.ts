import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { companies: true }
        });

        const companyId = user?.companies[0]?.id;
        if (!companyId) return NextResponse.json({ error: "No company found" }, { status: 400 });

        const { id } = await params;
        const { name, email, phone, notes } = await req.json();

        // Verify ownership
        const existingClient = await prisma.client.findFirst({
            where: { id, companyId }
        });

        if (!existingClient) return NextResponse.json({ error: "Client not found" }, { status: 404 });

        const client = await prisma.client.update({
            where: { id },
            data: {
                name,
                email: email || null,
                phone: phone || null,
                notes: notes || null,
            },
        });

        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { companies: true }
        });

        const companyId = user?.companies[0]?.id;
        if (!companyId) return NextResponse.json({ error: "No company found" }, { status: 400 });

        const { id } = await params;

        // Verify ownership
        const existingClient = await prisma.client.findFirst({
            where: { id, companyId }
        });

        if (!existingClient) return NextResponse.json({ error: "Client not found" }, { status: 404 });

        await prisma.client.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
