"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

type Booking = { id: string; startAt: string; status: string; service: { name: string }; provider: { user: { name: string } } };

export default function CustomerBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState<string | null>(null);

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

    async function cancel(id: string) {
        setMsg(null);
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
        >
            <div className="space-y-4 sm:space-y-6">
                <Button onClick={() => router.push("/customer/book")} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-xs sm:text-sm py-2 px-3">+ New Booking</Button>
            </div>

            {msg && <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-xs sm:text-sm border ${msg.includes("✅") ? 'dark:bg-green-900/30 bg-green-50 dark:text-green-300 text-green-700 dark:border-green-700/50 border-green-200' : 'dark:bg-red-900/30 bg-red-50 dark:text-red-300 text-red-700 dark:border-red-700/50 border-red-200'}`}>{msg}</div>}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-6 sm:p-8 text-center border">
                    <p className="dark:text-slate-400 text-slate-600 mb-4 text-sm sm:text-base">No bookings yet</p>
                    <Button onClick={() => router.push("/customer/book")} className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-2 px-3">Book Now</Button>
                </div>
            ) : upcomingBookings.length === 0 && pastBookings.length === 0 ? (
                <EmptyState
                    icon={<Calendar className="w-10 h-10" />}
                    title="No bookings yet"
                    description="Start by booking an appointment from the Book page"
                    actionLabel="Book Now"
                    onAction={() => router.push("/customer/book")}
                />
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    {upcomingBookings.length > 0 && <section>
                        <h3 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900 mb-3">Upcoming</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {upcomingBookings.map((b, idx) => {
                                const bookingStart = new Date(b.startAt);
                                const isToday = bookingStart.toDateString() === new Date().toDateString();
                                const isFuture = bookingStart > new Date();
                                return <div key={b.id} className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 hover:dark:border-slate-700 hover:border-slate-300 transition border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <h3 className="font-semibold dark:text-white text-slate-900 text-sm sm:text-base">{b.service?.name}</h3>
                                            {isToday && <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded">Today</span>}
                                        </div>
                                        <div className="space-y-1 text-xs sm:text-sm dark:text-slate-400 text-slate-600">
                                            <p>👤 {b.provider?.user?.name}</p>
                                            <p>🕐 {bookingStart.toLocaleDateString()} at {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                                            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${b.status === "CONFIRMED" ? 'dark:bg-green-900/30 bg-green-50 dark:text-green-300 text-green-700' : 'dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-700'}`}>{b.status}</span>
                                        </div>
                                    </div>
                                    <Button onClick={() => cancel(b.id)} disabled={!isFuture || cancelingId === b.id} className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-1.5 px-3 rounded flex-shrink-0">{cancelingId === b.id ? ".." : "Cancel"}</Button>
                                </div>
                            })}
                        </div>
                    </section>}

                    {pastBookings.length > 0 && <section>
                        <h3 className="text-base sm:text-lg font-semibold dark:text-slate-300 text-slate-700 mb-3">History</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {pastBookings.map((b, idx) => {
                                const bookingStart = new Date(b.startAt);
                                return <div key={b.id} className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-3 sm:p-4 border">
                                    <div>
                                        <h3 className="font-semibold dark:text-slate-200 text-slate-800 text-sm sm:text-base">{b.service?.name}</h3>
                                        <div className="space-y-1 text-xs sm:text-sm dark:text-slate-400 text-slate-600 mt-2">
                                            <p>👤 {b.provider?.user?.name}</p>
                                            <p>🕐 {bookingStart.toLocaleDateString()} at {bookingStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                                            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${b.status === "COMPLETED" ? 'dark:bg-blue-900/30 bg-blue-50 dark:text-blue-300 text-blue-700' : 'dark:bg-red-900/30 bg-red-50 dark:text-red-300 text-red-700'}`}>{b.status}</span>
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>
                    </section>}
                </div>
            )}

            <div className="mt-8 text-center text-xs sm:text-sm dark:text-slate-500 text-slate-500">
                <a href="/api/auth/logout" className="dark:text-blue-400 text-blue-600 hover:dark:text-blue-300 hover:text-blue-700">Sign Out</a>
            </div>
        </PageShell>
    );
}
