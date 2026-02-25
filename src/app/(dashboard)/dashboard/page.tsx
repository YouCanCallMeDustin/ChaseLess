import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { AlertCircle, CheckCircle2, Clock, DollarSign } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true },
    });

    const companyId = user?.companies[0]?.id;
    if (!companyId) return <div className="p-8">No company found. Please contact support.</div>;

    const invoices = await prisma.invoice.findMany({
        where: { companyId },
    });

    const pendingInvoices = invoices.filter((i: any) => i.status === 'pending');
    const overdueInvoices = invoices.filter((i: any) => i.status === 'overdue');
    const paidInvoices = invoices.filter((i: any) => i.status === 'paid');

    const totalOutstanding = [...pendingInvoices, ...overdueInvoices].reduce((acc: number, i: any) => acc + i.amountCents, 0);

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Outstanding */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 text-slate-600 mb-4">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Total Outstanding</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalOutstanding)}</p>
                </div>

                {/* Overdue */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 text-slate-600 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold">Overdue ({overdueInvoices.length})</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {formatCurrency(overdueInvoices.reduce((acc: number, i: any) => acc + i.amountCents, 0))}
                    </p>
                </div>

                {/* Pending */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 text-slate-600 mb-4">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">Pending ({pendingInvoices.length})</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {formatCurrency(pendingInvoices.reduce((acc: number, i: any) => acc + i.amountCents, 0))}
                    </p>
                </div>

                {/* Paid */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 text-slate-600 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold">Paid ({paidInvoices.length})</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                        {formatCurrency(paidInvoices.reduce((acc: number, i: any) => acc + i.amountCents, 0))}
                    </p>
                </div>
            </div>

            {overdueInvoices.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                    <h2 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Action Needed
                    </h2>
                    <p className="text-red-700">
                        You have {overdueInvoices.length} overdue invoices. Head over to your Invoices tab to escalate communications and maintain payment discipline.
                    </p>
                </div>
            )}
        </div>
    );
}
