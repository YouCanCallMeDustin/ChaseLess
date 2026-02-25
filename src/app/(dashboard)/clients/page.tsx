import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, User } from "lucide-react";

export default async function ClientsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true },
    });

    const companyId = user?.companies[0]?.id;
    if (!companyId) redirect("/dashboard");

    const clients = await prisma.client.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
                <Link
                    href="/clients/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> New Client
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {clients.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <User className="w-12 h-12 mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No clients yet</h3>
                        <p className="mb-4 text-sm">Add your first client to start tracking invoices.</p>
                        <Link
                            href="/clients/new"
                            className="text-blue-600 font-medium hover:underline text-sm"
                        >
                            + Create Client
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b text-sm text-slate-500 font-medium">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Phone</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {clients.map((client: any) => (
                                    <tr key={client.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-medium text-slate-900">{client.name}</td>
                                        <td className="p-4 text-slate-600">{client.email || "-"}</td>
                                        <td className="p-4 text-slate-600">{client.phone || "-"}</td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/clients/${client.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
