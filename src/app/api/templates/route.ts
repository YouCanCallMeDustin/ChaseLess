import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { companies: true }
        });

        const companyId = user?.companies[0]?.id;
        if (!companyId) return NextResponse.json({ error: "No company found" }, { status: 400 });

        const { friendlyText, firmText, finalText, demandText } = await req.json();

        const template = await prisma.template.update({
            where: { companyId },
            data: {
                friendlyText,
                firmText,
                finalText,
                demandText,
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
