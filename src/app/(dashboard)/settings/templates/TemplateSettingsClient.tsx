"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Check } from "lucide-react";

export default function TemplateSettingsClient({ initialTemplates }: { initialTemplates: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [friendly, setFriendly] = useState(initialTemplates.friendlyText);
    const [firm, setFirm] = useState(initialTemplates.firmText);
    const [final, setFinal] = useState(initialTemplates.finalText);
    const [demand, setDemand] = useState(initialTemplates.demandText);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/templates", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    friendlyText: friendly,
                    firmText: firm,
                    finalText: final,
                    demandText: demand,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update templates");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">Message Templates</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                <p className="text-slate-600 mb-8">
                    Customize the default templates used in your escalation timeline.
                    Use variable tags like <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-blue-700 font-mono">[Client First Name]</code>,
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-blue-700 font-mono">[Invoice Number]</code>,
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-blue-700 font-mono">[Amount]</code>, and
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-blue-700 font-mono">[Due Date]</code> to personalize messages.
                </p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>}
                {success && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md mb-6 text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Templates saved successfully!</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Day 3: Friendly Reminder</h3>
                        <textarea
                            value={friendly}
                            onChange={(e) => setFriendly(e.target.value)}
                            rows={8}
                            className="w-full border border-slate-300 rounded-md p-4 outline-none focus:ring-2 focus:ring-blue-600 transition font-mono text-sm resize-y"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Day 7: Firm Reminder</h3>
                        <textarea
                            value={firm}
                            onChange={(e) => setFirm(e.target.value)}
                            rows={8}
                            className="w-full border border-slate-300 rounded-md p-4 outline-none focus:ring-2 focus:ring-blue-600 transition font-mono text-sm resize-y"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Day 14: Final Notice</h3>
                        <textarea
                            value={final}
                            onChange={(e) => setFinal(e.target.value)}
                            rows={8}
                            className="w-full border border-slate-300 rounded-md p-4 outline-none focus:ring-2 focus:ring-blue-600 transition font-mono text-sm resize-y"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Day 30: Demand Letter</h3>
                        <textarea
                            value={demand}
                            onChange={(e) => setDemand(e.target.value)}
                            rows={8}
                            className="w-full border border-slate-300 rounded-md p-4 outline-none focus:ring-2 focus:ring-blue-600 transition font-mono text-sm resize-y"
                        />
                    </div>

                    <div className="pt-4 flex justify-end sticky bottom-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Templates</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
