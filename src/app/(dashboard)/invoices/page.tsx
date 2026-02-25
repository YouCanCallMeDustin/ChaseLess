import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoicesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true }
    });

    const companyId = user?.companies[0]?.id;
    if (!companyId) redirect("/dashboard");

    const invoices = await prisma.invoice.findMany({
        where: { companyId },
        include: { client: true },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>;
            case 'overdue':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><AlertCircle className="w-3.5 h-3.5" /> Overdue</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                <Link
                    href="/invoices/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> New Invoice
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {invoices.length === 0 ? (
                    <div className="p-12 text-center text-slate-700 flex flex-col items-center">
                        <Receipt className="w-12 h-12 mb-4 text-slate-500" />
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No invoices yet</h3>
                        <p className="mb-4 text-sm">Create an invoice manually to track its timeline.</p>
                        <Link
                            href="/invoices/new"
                            className="text-blue-600 font-medium hover:underline text-sm"
                        >
                            + Create Invoice
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b text-sm text-slate-700 font-medium">
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Due Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {invoices.map((invoice: any) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">{getStatusBadge(invoice.status)}</td>
                                        <td className="p-4 font-medium text-slate-900">{invoice.client.name}</td>
                                        <td className="p-4 font-medium">{formatCurrency(invoice.amountCents)}</td>
                                        <td className="p-4 text-slate-600">{formatDate(new Date(invoice.dueDate))}</td>
                                        <td className="p-4 text-slate-600 truncate max-w-[200px]">{invoice.description}</td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/invoices/${invoice.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Manage
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
