"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

type ProviderRow = {
    providerProfileId: string;
    approved: boolean;
    bio?: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string; createdAt: string };
};

export default function AdminProvidersPage() {
    const [providers, setProviders] = useState<ProviderRow[]>([]);
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function load() {
        try {
            const res = await api<{ providers: ProviderRow[] }>("/api/admin/providers");
            setProviders(res.providers);
        } catch (e) {
            toastError(e, "Failed to load providers");
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function setApproved(providerProfileId: string, approved: boolean) {
        setMsg(null);
        try {
            setLoading(true);
            await api(`/api/admin/providers/${providerProfileId}`, {
                method: "PATCH",
                body: JSON.stringify({ approved }),
            });
            toastSuccess(approved ? "Provider approved" : "Provider rejected");
            await load();
        } catch (e) {
            toastError(e, "Failed to update provider");
        } finally {
            setLoading(false);
        }
    }

    const pending = providers.filter((p) => !p.approved);
    const approvedList = providers.filter((p) => p.approved);

    return (
        <PageShell
            title="Providers"
            description="Review and approve provider registrations"
        >
            <div className="space-y-4 sm:space-y-6">
                {/* Message */}
                {msg && (
                    <div className={`p-3 sm:p-4 rounded-lg text-xs sm:text-sm ${msg.includes("✅") ? "bg-green-900/30 border border-green-700/50 text-green-300" : "bg-red-900/30 border border-red-700/50 text-red-300"}`}>
                        {msg}
                    </div>
                )}

                {/* Pending Approval Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                        Pending Approval ({pending.length})
                    </h3>

                    {pending.length === 0 ? (
                        <EmptyState
                            icon={<Users className="w-10 h-10" />}
                            title="No pending providers"
                            description="All provider registration requests have been reviewed"
                        />
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {pending.map((p) => (
                                <div
                                    key={p.providerProfileId}
                                    className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white text-sm sm:text-base">{p.user.name}</div>
                                        <div className="text-xs sm:text-sm text-slate-400">{p.user.email}</div>
                                        <div className="text-xs sm:text-sm text-slate-400 mt-1">
                                            Bio: {p.bio || "—"}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Registered: {new Date(p.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            onClick={() => setApproved(p.providerProfileId, true)}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded transition-all text-xs sm:text-sm"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => setApproved(p.providerProfileId, false)}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded transition-all text-xs sm:text-sm"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Approved Providers Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                        Approved Providers ({approvedList.length})
                    </h3>

                    {approvedList.length === 0 ? (
                        <EmptyState
                            icon={<Users className="w-10 h-10" />}
                            title="No approved providers"
                            description="Approve providers above to see them listed here"
                        />
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {approvedList.map((p) => (
                                <div
                                    key={p.providerProfileId}
                                    className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white text-sm sm:text-base">{p.user.name}</div>
                                        <div className="text-xs sm:text-sm text-slate-400">{p.user.email}</div>
                                        <div className="text-xs text-green-400 mt-1">✓ Approved</div>
                                    </div>

                                    <Button
                                        onClick={() => setApproved(p.providerProfileId, false)}
                                        disabled={loading}
                                        className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded transition-all text-xs sm:text-sm flex-shrink-0"
                                    >
                                        Remove Approval
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PageShell>
    );
}
