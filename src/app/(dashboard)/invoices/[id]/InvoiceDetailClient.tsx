"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Copy, Check, MessageSquare } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

export default function InvoiceDetailClient({ invoice, templates }: { invoice: any, templates: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [copiedStage, setCopiedStage] = useState<string | null>(null);

    const isPaid = invoice.status === 'paid';
    const isOverdue = invoice.status === 'overdue';

    const toggleStatus = async () => {
        setLoading(true);
        const newStatus = isPaid ? (new Date() > new Date(invoice.dueDate) ? 'overdue' : 'pending') : 'paid';

        await fetch(`/api/invoices/${invoice.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        router.refresh();
        setLoading(false);
    };

    const processTemplate = (text: string) => {
        return text
            .replace(/\[Client First Name\]/g, invoice.client.name.split(' ')[0] || "Client")
            .replace(/\[Client Full Name\]/g, invoice.client.name)
            .replace(/\[Invoice Number\]/g, invoice.id.substring(0, 8).toUpperCase())
            .replace(/\[Amount\]/g, formatCurrency(invoice.amountCents))
            .replace(/\[Due Date\]/g, formatDate(new Date(invoice.dueDate)));
    };

    const copyToClipboard = async (text: string, stage: string) => {
        await navigator.clipboard.writeText(processTemplate(text));
        setCopiedStage(stage);
        setTimeout(() => setCopiedStage(null), 2000);
    };

    const markAsSent = async (stage: string) => {
        setLoading(true);
        await fetch("/api/commlogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                invoiceId: invoice.id,
                stage,
                channel: "manual_copy",
                recipientEmail: invoice.client.email || null,
            }),
        });
        router.refresh();
        setLoading(false);
    };

    const getStageStatus = (stageName: string) => {
        const log = invoice.commLogs.find((l: any) => l.stage === stageName);
        return log ? { sent: true, log } : { sent: false, log: null };
    };

    const stages = [
        { id: "friendly", name: "Day 3 Friendly Reminder", text: templates.friendlyText },
        { id: "firm", name: "Day 7 Firm Reminder", text: templates.firmText },
        { id: "final", name: "Day 14 Final Notice", text: templates.finalText },
        { id: "demand", name: "Day 30 Demand Letter", text: templates.demandText },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/invoices" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition">
                <ArrowLeft className="w-4 h-4" /> Back to invoices
            </Link>

            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Invoice {invoice.id.substring(0, 8).toUpperCase()}</h1>
                    <p className="text-slate-600">Client: <span className="font-semibold text-slate-900">{invoice.client.name}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(invoice.amountCents)}</p>
                        <p className="text-sm text-slate-700">Due {formatDate(new Date(invoice.dueDate))}</p>
                    </div>
                    <button
                        onClick={toggleStatus}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md font-medium transition disabled:opacity-70 flex items-center gap-2 ${isPaid ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                    >
                        {isPaid ? "Undo Paid" : <><CheckCircle2 className="w-4 h-4" /> Mark Paid</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" /> Escalation Timeline
                    </h2>

                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {stages.map((stage) => {
                            const status = getStageStatus(stage.id);
                            return (
                                <div key={stage.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        {status.sent ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <h3 className="font-bold text-slate-900">{stage.name}</h3>
                                            {status.sent && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">Sent</span>}
                                        </div>

                                        <div className="text-xs bg-slate-50 p-3 rounded text-slate-600 mb-4 whitespace-pre-wrap max-h-32 overflow-y-auto border border-slate-100 font-mono">
                                            {processTemplate(stage.text)}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(stage.text, stage.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded transition"
                                            >
                                                {copiedStage === stage.id ? <><Check className="w-4 h-4 text-emerald-600" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Message</>}
                                            </button>

                                            {!status.sent && !isPaid && (
                                                <button
                                                    onClick={() => markAsSent(stage.id)}
                                                    disabled={loading}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded transition disabled:opacity-70"
                                                >
                                                    Mark Sent
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" /> Communication Log
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        {invoice.commLogs.length === 0 ? (
                            <p className="text-sm text-slate-700 text-center py-6">No communications logged yet.</p>
                        ) : (
                            <ul className="space-y-4">
                                {invoice.commLogs.map((log: any) => (
                                    <li key={log.id} className="border-b last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm capitalize text-slate-900">{log.stage.replace('_', ' ')}</span>
                                            <span className="text-xs text-slate-700">{formatDate(new Date(log.sentAt))}</span>
                                        </div>
                                        <p className="text-xs text-slate-600">Method: {log.channel.replace('_', ' ')}</p>
                                        {log.recipientEmail && <p className="text-xs text-slate-700">To: {log.recipientEmail}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
