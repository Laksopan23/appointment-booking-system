"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, XCircle, Loader2, CalendarCheck, History } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

type Booking = {
    id: string;
    startAt: string;
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
    service: { name: string };
    customerId: string;
};

export default function ProviderBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            const res = await api<{ bookings: Booking[] }>("/api/bookings");
            setBookings(res.bookings);
        } catch (e) {
            toastError(e, "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function setStatus(id: string, status: "COMPLETED" | "CANCELLED") {
        try {
            setActionId(id);
            await api(`/api/bookings/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            toastSuccess(`Booking ${status.toLowerCase()}`);
            await load();
        } catch (e) {
            toastError(e, "Failed to update status");
        } finally {
            setActionId(null);
        }
    }

    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
    const otherBookings = bookings.filter((b) => b.status !== "CONFIRMED");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "badge-warning";
            case "COMPLETED":
                return "badge-success";
            case "CANCELLED":
                return "badge-destructive";
            default:
                return "badge-muted";
        }
    };

    return (
        <PageShell
            title="Your Bookings"
            description="Manage customer appointments and update their status"
        >
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : bookings.length === 0 ? (
                <EmptyState
                    icon={<Calendar className="w-10 h-10" />}
                    title="No bookings yet"
                    description="Customer bookings will appear here once they start booking your services"
                />
            ) : (
                <div className="space-y-6">
                    {/* Confirmed Bookings */}
                    {confirmedBookings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarCheck className="h-5 w-5 text-warning" />
                                    Pending Bookings
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({confirmedBookings.length})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {confirmedBookings.map((b) => {
                                    const bookingStart = new Date(b.startAt);
                                    return (
                                        <div
                                            key={b.id}
                                            className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-foreground">{b.service?.name}</span>
                                                        <span className={getStatusBadge(b.status)}>{b.status}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {bookingStart.toDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 flex-shrink-0">
                                                    <Button
                                                        onClick={() => setStatus(b.id, "COMPLETED")}
                                                        disabled={actionId === b.id}
                                                        variant="success"
                                                        size="sm"
                                                    >
                                                        {actionId === b.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                Complete
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setStatus(b.id, "CANCELLED")}
                                                        disabled={actionId === b.id}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        {actionId === b.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Completed/Cancelled */}
                    {otherBookings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-muted-foreground" />
                                    History
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({otherBookings.length})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {otherBookings.map((b) => {
                                    const bookingStart = new Date(b.startAt);
                                    return (
                                        <div
                                            key={b.id}
                                            className="bg-surface/50 border border-border/50 rounded-xl p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-muted-foreground">{b.service?.name}</span>
                                                        <span className={getStatusBadge(b.status)}>{b.status}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {bookingStart.toDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </PageShell>
    );
}
