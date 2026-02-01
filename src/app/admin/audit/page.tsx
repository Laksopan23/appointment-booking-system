"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, ChevronDown, ChevronUp, Clock, User, Target } from "lucide-react";

type AuditLog = {
    id: string;
    actorId: string;
    actorRole: string;
    action: string;
    target: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    actor: { name: string };
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setError(null);
                const res = await api<{ logs: AuditLog[] }>("/api/admin/audit-logs");
                setLogs(res.logs || []);
            } catch (error) {
                console.error("Failed to load audit logs:", error);
                setError("Failed to load audit logs");
                setLogs([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const formatAction = (action: string) => {
        return action
            .split("_")
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(" ");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "badge-destructive";
            case "PROVIDER":
                return "badge-primary";
            case "CUSTOMER":
                return "badge-accent";
            default:
                return "badge-muted";
        }
    };

    const getActionBadgeClass = (action: string) => {
        if (action.includes("CREATED") || action.includes("APPROVED"))
            return "badge-success";
        if (action.includes("CANCELLED") || action.includes("REJECTED"))
            return "badge-destructive";
        if (action.includes("UPDATED") || action.includes("CHANGED"))
            return "badge-primary";
        return "badge-muted";
    };

    return (
        <PageShell
            title="Audit Logs"
            description="Track all system activity and administrative actions"
        >
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive mb-6">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : logs.length === 0 ? (
                <EmptyState
                    icon={<Shield className="w-10 h-10" />}
                    title="No audit logs yet"
                    description="System activity will appear here"
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Activity Log
                            <span className="text-sm font-normal text-muted-foreground">({logs.length} entries)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-surface border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Time</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actor</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Target</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, idx) => (
                                        <tr
                                            key={log.id}
                                            className={`border-b border-border hover:bg-surface/50 transition-colors ${idx % 2 === 0 ? "bg-card" : "bg-surface/30"
                                                }`}
                                        >
                                            <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                {log.actor?.name || log.actorId}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getRoleBadgeClass(log.actorRole)}>
                                                    {log.actorRole}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getActionBadgeClass(log.action)}>
                                                    {formatAction(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                                                {log.target}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground truncate">
                                                    {log.actor?.name || log.actorId}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(log.createdAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                        >
                                            {expandedId === log.id ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={getRoleBadgeClass(log.actorRole)}>
                                            {log.actorRole}
                                        </span>
                                        <span className={getActionBadgeClass(log.action)}>
                                            {formatAction(log.action)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Target className="h-3 w-3 flex-shrink-0" />
                                        <span className="font-mono text-xs break-all">{log.target}</span>
                                    </div>

                                    {expandedId === log.id && log.metadata && (
                                        <div className="mt-3 pt-3 border-t border-border">
                                            <p className="text-xs font-medium text-foreground mb-2">Details:</p>
                                            <pre className="text-xs text-muted-foreground bg-background rounded-lg p-2 overflow-auto max-h-40">
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Footer */}
            {!loading && logs.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 mt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full" />
                        Total Logs: <span className="font-semibold text-foreground">{logs.length}</span>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
