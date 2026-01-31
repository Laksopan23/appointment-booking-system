"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

type ProviderMe = {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "PROVIDER" | "ADMIN";
};

type ProviderItem = {
    providerProfileId: string;
    userId: string;
    name: string;
    bio?: string | null;
};

type AvailabilityBlock = {
    id: string;
    startAt: string;
    endAt: string;
    active: boolean;
};

export default function ProviderAvailabilityPage() {
    const [me, setMe] = useState<ProviderMe | null>(null);
    const [providerProfileId, setProviderProfileId] = useState<string>("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("12:00");
    const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function loadMeAndProfile() {
        try {
            const res = await api<{ user: ProviderMe | null }>("/api/auth/me");
            if (!res.user) return;
            setMe(res.user);

            const p = await api<{ providers: ProviderItem[] }>("/api/providers");
            const mine = p.providers.find((x) => x.userId === res.user!.id);
            if (mine) setProviderProfileId(mine.providerProfileId);
        } catch (e) {
            setMsg("Failed to load profile");
        }
    }

    async function loadBlocks(d: string) {
        setMsg(null);
        if (!providerProfileId || !d) return;
        try {
            // Calculate startAt range for the day (00:00 to 23:59)
            const dateObj = new Date(d);
            const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0).toISOString();
            const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999).toISOString();

            const res = await api<{ blocks: AvailabilityBlock[] }>(
                `/api/availability?providerId=${providerProfileId}&startAt=${encodeURIComponent(startOfDay)}&endAt=${encodeURIComponent(endOfDay)}`
            );
            setBlocks(res.blocks);
        } catch (e: any) {
            setMsg("Failed to load blocks");
        }
    }

    useEffect(() => {
        loadMeAndProfile();
    }, []);

    useEffect(() => {
        if (date && providerProfileId) {
            loadBlocks(date);
        }
    }, [date, providerProfileId]);

    async function createAvailability() {
        setMsg(null);
        try {
            setLoading(true);
            // Construct startAt and endAt ISO datetime strings
            const dateObj = new Date(date);
            const [startHours, startMins] = startTime.split(":").map(Number);
            const [endHours, endMins] = endTime.split(":").map(Number);

            const startAt = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), startHours, startMins, 0, 0).toISOString();
            const endAt = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), endHours, endMins, 0, 0).toISOString();

            await api("/api/availability", {
                method: "POST",
                body: JSON.stringify({ startAt, endAt }),
            });
            toastSuccess("Availability added");
            await loadBlocks(date);
        } catch (e) {
            toastError(e, "Failed to add availability");
        } finally {
            setLoading(false);
        }
    }

    if (!me) {
        return (
            <main className="min-h-screen p-4 sm:p-6 dark:bg-slate-950 bg-white flex items-center justify-center">
                <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-6 sm:p-8 text-center border">
                    <p className="dark:text-slate-400 text-slate-600 text-sm sm:text-base">Please login as a provider</p>
                </div>
            </main>
        );
    }

    return (
        <PageShell
            title="My Availability"
            description="Set your working hours and availability blocks"
        >
            <div className="space-y-4 sm:space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Create Block Form */}
                    <section className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 border">
                        <h3 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900 mb-3 sm:mb-4">
                            Create Availability Block
                        </h3>

                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="text-xs sm:text-sm font-semibold dark:text-slate-200 text-slate-700 block mb-2">Date</label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 text-sm border"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <div>
                                    <label className="text-xs sm:text-sm font-semibold dark:text-slate-200 text-slate-700 block mb-2">Start Time</label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 text-sm border"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs sm:text-sm font-semibold dark:text-slate-200 text-slate-700 block mb-2">End Time</label>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 text-sm border"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={createAvailability}
                                disabled={!date || !providerProfileId || loading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-70 text-sm"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </span>
                                ) : (
                                    "Create Block"
                                )}
                            </Button>

                            {msg && (
                                <div className={`p-3 sm:p-4 rounded-lg text-xs sm:text-sm border ${msg.includes("✅")
                                    ? 'dark:bg-green-900/30 bg-green-50 dark:text-green-300 text-green-700 dark:border-green-700/50 border-green-200'
                                    : 'dark:bg-red-900/30 bg-red-50 dark:text-red-300 text-red-700 dark:border-red-700/50 border-red-200'
                                    }`}>
                                    {msg}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Available Blocks */}
                    <section className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 border">
                        <h3 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900 mb-3 sm:mb-4">
                            Your Availability Blocks
                        </h3>

                        {!date ? (
                            <div className="text-center py-8">
                                <p className="dark:text-slate-400 text-slate-600">Pick a date above to see availability blocks</p>
                            </div>
                        ) : blocks.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="dark:text-slate-400 text-slate-600">No availability blocks for this date</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {blocks.map((b, idx) => {
                                    const startAtDate = new Date(b.startAt);
                                    const endAtDate = new Date(b.endAt);
                                    const startTimeStr = startAtDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                    const endTimeStr = endAtDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                    return (
                                        <div key={b.id} className="p-4 dark:bg-slate-700/30 bg-slate-100 dark:border-slate-600 border-slate-300 rounded-lg hover:dark:border-purple-500/50 hover:border-purple-300 transition-all animate-slideUp border" style={{ animationDelay: `${idx * 0.05}s` }}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-semibold dark:text-white text-slate-900">
                                                        {startTimeStr} - {endTimeStr}
                                                    </div>
                                                    <div className="text-sm dark:text-slate-400 text-slate-600 mt-1">
                                                        {startAtDate.toDateString()}
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${b.active
                                                    ? 'dark:bg-green-900/30 bg-green-50 dark:text-green-300 text-green-700'
                                                    : 'dark:bg-slate-700 bg-slate-200 dark:text-slate-400 text-slate-600'
                                                    }`}>
                                                    {b.active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </PageShell>
    );
}
