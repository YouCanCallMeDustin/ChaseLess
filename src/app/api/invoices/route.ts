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

        const { clientId, amountCents, description, dueDate, termsText, status } = await req.json();

        if (!clientId || !amountCents || !description || !dueDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify client belongs to this company
        const client = await prisma.client.findFirst({
            where: { id: clientId, companyId }
        });

        if (!client) {
            return NextResponse.json({ error: "Invalid client" }, { status: 400 });
        }

        const invoice = await prisma.invoice.create({
            data: {
                companyId,
                clientId,
                amountCents,
                description,
                dueDate: new Date(dueDate),
                termsText: termsText || null,
                status: status || "pending",
            },
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error("Failed to create invoice", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
