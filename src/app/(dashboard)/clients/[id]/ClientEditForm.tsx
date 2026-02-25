"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function ClientEditForm({ client }: { client: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            notes: formData.get("notes"),
        };

        try {
            const res = await fetch(`/api/clients/${client.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const d = await res.json();
                setError(d.error || "Failed to update client");
                setLoading(false);
                return;
            }

            router.push("/clients");
            router.refresh();
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this client? All associated invoices will also be deleted. This cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${client.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const d = await res.json();
                setError(d.error || "Failed to delete client");
                setLoading(false);
                return;
            }

            router.push("/clients");
            router.refresh();
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to clients
            </Link>

            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Edit Client</h1>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition"
                        title="Delete Client"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company / Contact Name *</label>
                        <input
                            name="name"
                            type="text"
                            required
                            defaultValue={client.name}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="Acme Corp or John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={client.email || ""}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition"
                                placeholder="billing@acme.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                name="phone"
                                type="tel"
                                defaultValue={client.phone || ""}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Private Notes</label>
                        <textarea
                            name="notes"
                            rows={4}
                            defaultValue={client.notes || ""}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 transition resize-none"
                            placeholder="Internal notes about this client..."
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <Link href="/clients" className="px-4 py-2 border rounded-md text-slate-700 font-medium hover:bg-slate-50 transition">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-70"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
