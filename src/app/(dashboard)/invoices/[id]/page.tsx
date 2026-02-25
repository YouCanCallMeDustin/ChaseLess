import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InvoiceDetailClient from "./InvoiceDetailClient";
import fs from "fs";
import path from "path";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true }
    });

    const companyId = user?.companies[0]?.id;
    if (!companyId) redirect("/dashboard");

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
        where: { id, companyId },
        include: {
            client: true,
            commLogs: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!invoice) redirect("/invoices");

    let templates = await prisma.template.findUnique({
        where: { companyId }
    });

    // If no templates, load from DEFAULT_TEMPLATE_PACK and create them.
    if (!templates) {
        try {
            const templatePath = path.join(process.cwd(), "CHASELESS_DEFAULT_TEMPLATE_PACK.txt");
            const templateText = fs.readFileSync(templatePath, "utf-8");

            const friendlyMatch = templateText.match(/STAGE 1: FRIENDLY REMINDER([\s\S]*?)---/);
            const firmMatch = templateText.match(/STAGE 2: FIRM REMINDER([\s\S]*?)---/);
            const finalMatch = templateText.match(/STAGE 3: FINAL NOTICE([\s\S]*?)---/);
            const demandMatch = templateText.match(/STAGE 4: DEMAND LETTER DRAFT([\s\S]*)/);

            templates = await prisma.template.create({
                data: {
                    companyId,
                    friendlyText: friendlyMatch ? friendlyMatch[1].trim() : "Friendly reminder...",
                    firmText: firmMatch ? firmMatch[1].trim() : "Firm reminder...",
                    finalText: finalMatch ? finalMatch[1].trim() : "Final notice...",
                    demandText: demandMatch ? demandMatch[1].trim() : "Demand letter...",
                }
            });
        } catch (e) {
            // Fallback if file read fails
            templates = await prisma.template.create({
                data: {
                    companyId,
                    friendlyText: "Friendly Reminder Placeholder. Edit in Settings.",
                    firmText: "Firm Reminder Placeholder. Edit in Settings.",
                    finalText: "Final Notice Placeholder. Edit in Settings.",
                    demandText: "Demand Letter Placeholder. Edit in Settings.",
                }
            });
        }
    }

    return <InvoiceDetailClient invoice={invoice} templates={templates} />;
}
