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
        const { status } = await req.json();

        // Verify ownership
        const existingInvoice = await prisma.invoice.findFirst({
            where: { id, companyId }
        });

        if (!existingInvoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        const invoice = await prisma.invoice.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
