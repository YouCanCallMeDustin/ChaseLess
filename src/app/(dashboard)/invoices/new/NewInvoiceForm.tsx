"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewInvoiceForm({ clients }: { clients: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const amountFloat = parseFloat(formData.get("amount") as string);

        if (isNaN(amountFloat) || amountFloat <= 0) {
            setError("Please enter a valid amount");
            setLoading(false);
            return;
        }

        const data = {
            clientId: formData.get("clientId"),
            amountCents: Math.round(amountFloat * 100),
            description: formData.get("description"),
            dueDate: formData.get("dueDate"),
            termsText: formData.get("termsText"),
            status: formData.get("status"),
        };

        try {
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const d = await res.json();
                setError(d.error || "Failed to create invoice");
                setLoading(false);
                return;
            }

            router.push("/invoices");
            router.refresh();
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/invoices" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to invoices
            </Link>

            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                <h1 className="text-xl font-bold text-slate-900 mb-6">Record Manual Invoice</h1>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
                        <select
                            name="clientId"
                            required
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition bg-white"
                        >
                            <option value="">Select a client...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USD) *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500">$</span>
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    className="w-full border border-slate-300 rounded-md pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                            <input
                                name="dueDate"
                                type="date"
                                required
                                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Short Description *</label>
                        <input
                            name="description"
                            type="text"
                            required
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="e.g. Lawn care services for March"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms (Optional)</label>
                        <input
                            name="termsText"
                            type="text"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="e.g. Net 30, Due on Receipt"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Status</label>
                        <select
                            name="status"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition bg-white"
                        >
                            <option value="pending">Pending (Not due yet)</option>
                            <option value="overdue">Overdue</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <Link href="/invoices" className="px-4 py-2 border rounded-md text-slate-700 font-medium hover:bg-slate-50 transition">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-70"
                        >
                            {loading ? "Saving..." : "Record Invoice"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
