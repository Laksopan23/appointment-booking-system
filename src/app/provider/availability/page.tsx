"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, Loader2 } from "lucide-react";
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
    const [loading, setLoading] = useState(false);

    async function loadMeAndProfile() {
        try {
            const res = await api<{ user: ProviderMe | null }>("/api/auth/me");
            if (!res.user) return;
            setMe(res.user);

            const p = await api<{ providers: ProviderItem[] }>("/api/providers");
            const mine = p.providers.find((x) => x.userId === res.user!.id);
            if (mine) setProviderProfileId(mine.providerProfileId);
        } catch {
            toastError("Failed to load profile");
        }
    }

    async function loadBlocks(d: string) {
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
        } catch {
            toastError("Failed to load blocks");
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
            <main className="min-h-screen p-4 sm:p-6 bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="py-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading your profile...</p>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <PageShell
            title="My Availability"
            description="Set your working hours and availability blocks"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Block Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Create Availability Block
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Date</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Start Time</label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">End Time</label>
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={createAvailability}
                            disabled={!date || !providerProfileId || loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Block
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Available Blocks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Your Availability Blocks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!date ? (
                            <EmptyState
                                icon={<Calendar className="w-10 h-10" />}
                                title="Select a date"
                                description="Pick a date above to see availability blocks"
                            />
                        ) : blocks.length === 0 ? (
                            <EmptyState
                                icon={<Clock className="w-10 h-10" />}
                                title="No availability blocks"
                                description="Create your first availability block for this date"
                            />
                        ) : (
                            <div className="space-y-3">
                                {blocks.map((b) => {
                                    const startAtDate = new Date(b.startAt);
                                    const endAtDate = new Date(b.endAt);
                                    const startTimeStr = startAtDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                    const endTimeStr = endAtDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                    return (
                                        <div
                                            key={b.id}
                                            className="p-4 bg-surface border border-border rounded-xl hover:border-primary/30 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-primary" />
                                                        <span className="font-semibold text-foreground">
                                                            {startTimeStr} - {endTimeStr}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {startAtDate.toDateString()}
                                                    </p>
                                                </div>
                                                <span className={b.active ? 'badge-success' : 'badge-muted'}>
                                                    {b.active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageShell>
    );
}
