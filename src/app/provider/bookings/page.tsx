"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";

type Booking = {
    id: string;
    startAt: string;
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
    service: { name: string };
    customerId: string;
};

export default function ProviderBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            const res = await api<{ bookings: Booking[] }>("/api/bookings");
            setBookings(res.bookings);
        } catch (e: any) {
            setMsg("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function setStatus(id: string, status: "COMPLETED" | "CANCELLED") {
        setMsg(null);
        try {
            setActionId(id);
            await api(`/api/bookings/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            setMsg(`✅ Status updated to ${status}`);
            await load();
        } catch (e: any) {
            setMsg("❌ " + (e.message || "Failed"));
        } finally {
            setActionId(null);
        }
    }

    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
    const otherBookings = bookings.filter((b) => b.status !== "CONFIRMED");

    return (
        <PageShell
            title="Your Bookings"
            description="Manage customer appointments and update their status"
        >
            <div className="space-y-4 sm:space-y-6">

                {msg && (
                    <div className={`mb-0 p-3 sm:p-4 rounded-lg text-xs sm:text-sm border ${msg.includes("✅")
                        ? 'dark:bg-green-900/30 bg-green-50 dark:text-green-300 text-green-700 dark:border-green-700/50 border-green-200'
                        : 'dark:bg-red-900/30 bg-red-50 dark:text-red-300 text-red-700 dark:border-red-700/50 border-red-200'
                        }`}>
                        {msg}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-3 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <EmptyState
                        icon={<Calendar className="w-10 h-10" />}
                        title="No bookings yet"
                        description="Customer bookings will appear here once they start booking your services"
                    />
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Confirmed Bookings */}
                        {confirmedBookings.length > 0 && (
                            <section>
                                <h3 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900 mb-3">
                                    Pending Bookings ({confirmedBookings.length})
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                    {confirmedBookings.map((b, idx) => {
                                        const bookingStart = new Date(b.startAt);
                                        return <div
                                            key={b.id}
                                            className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-3 sm:p-4 hover:dark:border-slate-700 hover:border-slate-300 transition-all border"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold dark:text-white text-slate-900 text-sm sm:text-base">{b.service?.name}</h3>
                                                    <div className="space-y-1 text-xs sm:text-sm dark:text-slate-400 text-slate-600 mt-2">
                                                        <p>📅 {bookingStart.toDateString()}</p>
                                                        <p>🕐 {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                                                        <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium dark:bg-yellow-900/30 bg-yellow-50 dark:text-yellow-300 text-yellow-700">
                                                            {b.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 flex-shrink-0">
                                                    <Button
                                                        onClick={() => setStatus(b.id, "COMPLETED")}
                                                        disabled={actionId === b.id}
                                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs sm:text-sm py-1.5 px-3 rounded transition-colors"
                                                    >
                                                        {actionId === b.id ? "..." : "Complete"}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setStatus(b.id, "CANCELLED")}
                                                        disabled={actionId === b.id}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm py-1.5 px-3 rounded transition-colors"
                                                    >
                                                        {actionId === b.id ? "..." : "Cancel"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Completed/Cancelled */}
                        {otherBookings.length > 0 && (
                            <section>
                                <h3 className="text-lg font-medium dark:text-slate-400 text-slate-600 mb-3">
                                    History ({otherBookings.length})
                                </h3>
                                <div className="space-y-3">
                                    {otherBookings.map((b, idx) => {
                                        const bookingStart = new Date(b.startAt);
                                        return <div
                                            key={b.id}
                                            className="dark:bg-slate-800/50 bg-slate-100/50 dark:border-slate-700/50 border-slate-300/50 rounded-lg p-4 animate-slideUp border"
                                            style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold dark:text-slate-300 text-slate-700">{b.service?.name}</h3>
                                                    <div className="space-y-1 text-sm dark:text-slate-500 text-slate-600 mt-2">
                                                        <p>📅 {bookingStart.toDateString()}</p>
                                                        <p>🕐 {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                                                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${b.status === "COMPLETED"
                                                            ? 'dark:bg-blue-900/30 bg-blue-50 dark:text-blue-300 text-blue-700'
                                                            : 'dark:bg-red-900/30 bg-red-50 dark:text-red-300 text-red-700'
                                                            }`}>
                                                            {b.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </PageShell>
    );
}
