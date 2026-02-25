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

        const { invoiceId, stage, channel, recipientEmail, notes } = await req.json();

        if (!invoiceId || !stage || !channel) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Creating comm log
        const log = await prisma.commLog.create({
            data: {
                invoiceId,
                stage,
                channel,
                recipientEmail: recipientEmail || null,
                notes: notes || null,
                sentAt: new Date()
            },
        });

        return NextResponse.json(log, { status: 201 });
    } catch (error) {
        console.error("Failed to log communication", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
