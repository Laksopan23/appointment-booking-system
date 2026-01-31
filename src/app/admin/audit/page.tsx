"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Shield } from "lucide-react";

type AuditLog = {
    id: string;
    actorId: string;
    actorRole: string;
    action: string;
    target: string;
    metadata: any;
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

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-900/50 text-red-200 border border-red-700";
            case "PROVIDER":
                return "bg-purple-900/50 text-purple-200 border border-purple-700";
            case "CUSTOMER":
                return "bg-blue-900/50 text-blue-200 border border-blue-700";
            default:
                return "bg-slate-700/50 text-slate-200 border border-slate-600";
        }
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes("CREATED") || action.includes("APPROVED"))
            return "bg-green-900/50 text-green-200 border border-green-700";
        if (action.includes("CANCELLED") || action.includes("REJECTED"))
            return "bg-red-900/50 text-red-200 border border-red-700";
        if (action.includes("UPDATED") || action.includes("CHANGED"))
            return "bg-blue-900/50 text-blue-200 border border-blue-700";
        return "bg-slate-700/50 text-slate-200 border border-slate-600";
    };

    return (
        <PageShell
            title="Audit Logs"
            description="Track all system activity and administrative actions"
        >
            {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                <EmptyState
                    icon={<Shield className="w-10 h-10" />}
                    title="No audit logs yet"
                    description="System activity will appear here"
                />
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Time</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Actor</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Role</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Action</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Target</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, idx) => (
                                    <tr
                                        key={log.id}
                                        className={`border-b border-slate-700 hover:bg-slate-800/50 transition-colors ${idx % 2 === 0 ? "bg-slate-900" : "bg-slate-800/20"
                                            }`}
                                    >
                                        <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {log.actor?.name || log.actorId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(log.actorRole)}`}>
                                                {log.actorRole}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                                                {formatAction(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">
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
                                className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {log.actor?.name || log.actorId}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {formatDate(log.createdAt)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                        className="text-slate-400 hover:text-slate-300 text-xl"
                                    >
                                        {expandedId === log.id ? "−" : "+"}
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(log.actorRole)}`}>
                                        {log.actorRole}
                                    </span>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                                        {formatAction(log.action)}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-400 font-mono break-all">
                                    <span className="text-slate-500">Target:</span> {log.target}
                                </p>

                                {expandedId === log.id && log.metadata && (
                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                        <p className="text-xs font-medium text-slate-300 mb-2">Details:</p>
                                        <pre className="text-xs text-slate-400 bg-slate-900/50 rounded p-2 overflow-auto max-h-40">
                                            {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Footer */}
            {!loading && logs.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 mt-8 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-slate-600 rounded-full" />
                        Total Logs: <span className="font-semibold text-white">{logs.length}</span>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
