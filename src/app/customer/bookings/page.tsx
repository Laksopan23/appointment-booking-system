"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CalendarCheck, Clock, History, Loader2, Plus, User, XCircle } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

type Booking = { id: string; startAt: string; status: string; service: { name: string }; provider: { user: { name: string } } };

function getStatusBadge(status: string) {
    switch (status) {
        case "CONFIRMED":
            return "badge-success";
        case "COMPLETED":
            return "badge-accent";
        case "CANCELLED":
            return "badge-destructive";
        default:
            return "badge-muted";
    }
}

export default function CustomerBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState<string | null>(null);

    async function load() {
        try {
            setLoading(true);
            const res = await api<{ bookings: Booking[] }>("/api/bookings");
            setBookings(res.bookings);
        } catch (e: any) {
            toastError(e, "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function cancel(id: string) {
        try {
            setCancelingId(id);
            await api(`/api/bookings/${id}/cancel`, { method: "PATCH" });
            toastSuccess("Booking cancelled");
            await load();
        } catch (e) {
            toastError(e, "Failed to cancel booking");
        } finally {
            setCancelingId(null);
        }
    }

    const upcomingBookings = bookings.filter((b) => b.status === "CONFIRMED");
    const pastBookings = bookings.filter((b) => b.status !== "CONFIRMED");

    return (
        <PageShell
            title="My Bookings"
            description="Manage your appointments"
            actions={
                <Button onClick={() => router.push("/customer/book")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Booking</span>
                    <span className="sm:hidden">Book</span>
                </Button>
            }
        >
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : bookings.length === 0 ? (
                <EmptyState
                    icon={<Calendar className="w-10 h-10" />}
                    title="No bookings yet"
                    description="Start by booking an appointment from the Book page"
                    actionLabel="Book Now"
                    onAction={() => router.push("/customer/book")}
                />
            ) : (
                <div className="space-y-6">
                    {/* Upcoming Bookings */}
                    {upcomingBookings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <CalendarCheck className="w-5 h-5 text-primary" />
                                    Upcoming Appointments
                                    <span className="ml-auto badge-success text-xs">
                                        {upcomingBookings.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {upcomingBookings.map((b) => {
                                    const bookingStart = new Date(b.startAt);
                                    const isToday = bookingStart.toDateString() === new Date().toDateString();
                                    const isFuture = bookingStart > new Date();

                                    return (
                                        <div
                                            key={b.id}
                                            className="bg-surface rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-border hover:border-primary/30 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                                        {b.service?.name}
                                                    </h3>
                                                    {isToday && (
                                                        <span className="badge-warning text-xs">Today</span>
                                                    )}
                                                    <span className={`${getStatusBadge(b.status)} text-xs`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                                    <p className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5" />
                                                        {b.provider?.user?.name}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {bookingStart.toLocaleDateString()} at {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => cancel(b.id)}
                                                disabled={!isFuture || cancelingId === b.id}
                                                className="gap-1.5 flex-shrink-0"
                                            >
                                                {cancelingId === b.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-3.5 h-3.5" />
                                                )}
                                                Cancel
                                            </Button>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Past Bookings */}
                    {pastBookings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-muted-foreground">
                                    <History className="w-5 h-5" />
                                    Booking History
                                    <span className="ml-auto badge-muted text-xs">
                                        {pastBookings.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {pastBookings.map((b) => {
                                    const bookingStart = new Date(b.startAt);

                                    return (
                                        <div
                                            key={b.id}
                                            className="bg-surface rounded-xl p-4 border border-border opacity-75"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-medium text-foreground text-sm sm:text-base mb-2">
                                                        {b.service?.name}
                                                    </h3>
                                                    <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                                        <p className="flex items-center gap-2">
                                                            <User className="w-3.5 h-3.5" />
                                                            {b.provider?.user?.name}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {bookingStart.toLocaleDateString()} at {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`${getStatusBadge(b.status)} text-xs flex-shrink-0`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty states for sections */}
                    {upcomingBookings.length === 0 && pastBookings.length > 0 && (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">No upcoming appointments</p>
                                <Button
                                    onClick={() => router.push("/customer/book")}
                                    className="mt-4 gap-2"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Book New Appointment
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </PageShell>
    );
}
