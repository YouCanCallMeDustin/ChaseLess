import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewInvoiceForm from "./NewInvoiceForm";

export default async function NewInvoicePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true }
    });

    const companyId = user?.companies[0]?.id;
    if (!companyId) redirect("/dashboard");

    const clients = await prisma.client.findMany({
        where: { companyId },
        orderBy: { name: 'asc' }
    });

    if (clients.length === 0) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold mb-2">Wait! Setup a client first.</h2>
                <p className="text-slate-600 mb-6">You need at least one client before you can record an invoice.</p>
                <a href="/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Add a Client</a>
            </div>
        );
    }

    return <NewInvoiceForm clients={clients} />;
}
