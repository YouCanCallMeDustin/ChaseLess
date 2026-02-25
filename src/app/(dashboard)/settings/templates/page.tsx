import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TemplateSettingsClient from "./TemplateSettingsClient";
import fs from "fs";
import path from "path";

export default async function TemplatesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true }
    });

    const companyId = user?.companies[0]?.id;
    if (!companyId) redirect("/dashboard");

    let templates = await prisma.template.findUnique({
        where: { companyId }
    });

    if (!templates) {
        // Generate default templates if they don't exist yet
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
        } catch {
            templates = await prisma.template.create({
                data: {
                    companyId,
                    friendlyText: "Friendly Reminder",
                    firmText: "Firm Reminder",
                    finalText: "Final Notice",
                    demandText: "Demand Letter",
                }
            });
        }
    }

    return <TemplateSettingsClient initialTemplates={templates} />;
}
