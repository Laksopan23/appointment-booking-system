"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock, Mail, CheckCircle2, XCircle } from "lucide-react";
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
            <div className="space-y-6">
                {/* Pending Approval Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-warning" />
                            Pending Approval
                            <span className="text-sm font-normal text-muted-foreground">({pending.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pending.length === 0 ? (
                            <EmptyState
                                icon={<UserCheck className="w-10 h-10" />}
                                title="No pending providers"
                                description="All provider registration requests have been reviewed"
                            />
                        ) : (
                            <div className="space-y-3">
                                {pending.map((p) => (
                                    <div
                                        key={p.providerProfileId}
                                        className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-foreground">{p.user.name}</span>
                                                <span className="badge-warning">Pending</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                <Mail className="h-3 w-3" />
                                                {p.user.email}
                                            </div>
                                            {p.bio && (
                                                <p className="text-sm text-muted-foreground mt-2">{p.bio}</p>
                                            )}
                                            <div className="text-xs text-muted-foreground mt-2">
                                                Registered: {new Date(p.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button
                                                onClick={() => setApproved(p.providerProfileId, true)}
                                                disabled={loading}
                                                variant="success"
                                                size="sm"
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => setApproved(p.providerProfileId, false)}
                                                disabled={loading}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Approved Providers Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-success" />
                            Approved Providers
                            <span className="text-sm font-normal text-muted-foreground">({approvedList.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {approvedList.length === 0 ? (
                            <EmptyState
                                icon={<Users className="w-10 h-10" />}
                                title="No approved providers"
                                description="Approve providers above to see them listed here"
                            />
                        ) : (
                            <div className="space-y-3">
                                {approvedList.map((p) => (
                                    <div
                                        key={p.providerProfileId}
                                        className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-foreground">{p.user.name}</span>
                                                <span className="badge-success">Approved</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                <Mail className="h-3 w-3" />
                                                {p.user.email}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setApproved(p.providerProfileId, false)}
                                            disabled={loading}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <UserX className="h-4 w-4 mr-1" />
                                            Remove Approval
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageShell>
    );
}
