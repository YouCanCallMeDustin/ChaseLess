import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientEditForm from "./ClientEditForm";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true }
    });

    const companyId = user?.companies[0]?.id;
    if (!companyId) redirect("/dashboard");

    // Await the params to resolve Next.js 15+ promise behavior or treat it directly but usually params are synchronous in server components unless dynamic
    // but let's access id
    const { id } = await params;

    const client = await prisma.client.findFirst({
        where: {
            id: id,
            companyId: companyId
        }
    });

    if (!client) {
        redirect("/clients");
    }

    return <ClientEditForm client={client} />;
}
