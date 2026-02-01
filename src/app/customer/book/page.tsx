"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, FileText, CheckCircle2, Loader2, ClipboardList } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

type Service = { id: string; name: string; durationMinutes: number };
type Provider = { providerProfileId: string; name: string; bio?: string | null };

export default function CustomerBookPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [serviceId, setServiceId] = useState("");
    const [providerProfileId, setProviderProfileId] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedStartAt, setSelectedStartAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const [s, p] = await Promise.all([
                    api<{ services: Service[] }>("/api/services"),
                    api<{ providers: Provider[] }>("/api/providers")
                ]);
                setServices(s.services);
                setProviders(p.providers);
            } catch {
                toastError("Failed to load data");
            } finally {
                setInitialLoad(false);
            }
        })();
    }, []);

    async function loadSlots() {
        setSlots([]);
        setSelectedStartAt("");
        if (!providerProfileId || !serviceId || !date || !time) {
            toastError("Select service, provider, date and time first");
            return;
        }
        try {
            setLoading(true);
            setCurrentStep(4);
            // Construct ISO datetime string from date and time inputs
            const dateObj = new Date(date);
            const [hours, minutes] = time.split(":").map(Number);
            dateObj.setHours(hours, minutes, 0, 0);
            const startAt = dateObj.toISOString();

            const res = await api<{ slots: string[] }>(
                `/api/slots?providerId=${providerProfileId}&serviceId=${serviceId}&startAt=${encodeURIComponent(startAt)}`
            );
            setSlots(res.slots);
            if (res.slots.length === 0) {
                toastError("No available slots for this date/time. Try another time.");
            }
        } catch {
            toastError("Failed to load slots");
        } finally {
            setLoading(false);
        }
    }

    async function book() {
        if (!selectedStartAt) {
            toastError("Select a time slot");
            return;
        }
        try {
            setLoading(true);
            await api("/api/bookings", {
                method: "POST",
                body: JSON.stringify({ providerProfileId, serviceId, startAt: selectedStartAt }),
            });
            toastSuccess("Booking confirmed!");
            setTimeout(() => {
                window.location.href = "/customer/bookings";
            }, 1500);
        } catch (e) {
            toastError(e, "Booking failed");
        } finally {
            setLoading(false);
        }
    }

    const selectedService = services.find((s) => s.id === serviceId);
    const selectedProvider = providers.find((p) => p.providerProfileId === providerProfileId);

    return (
        <PageShell
            title="Book an Appointment"
            description="Select your preferred service, provider, date and time"
        >
            {/* Progress Indicator */}
            <div className="mb-6">
                <div className="flex justify-between mb-3 gap-1">
                    {["Service", "Provider", "Date", "Time", "Confirm"].map((label, i) => (
                        <div key={i} className="text-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all text-sm mx-auto ${currentStep > i + 1
                                    ? 'bg-success text-success-foreground'
                                    : currentStep === i + 1
                                        ? 'bg-primary text-primary-foreground scale-110'
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                {currentStep > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{label}</p>
                        </div>
                    ))}
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 rounded-full"
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {initialLoad ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading services...</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Service Selection */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Select Service
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        value={serviceId}
                                        onChange={(e) => {
                                            setServiceId(e.target.value);
                                            setCurrentStep(1);
                                            setSlots([]);
                                            setSelectedStartAt("");
                                            setDate("");
                                            setTime("");
                                        }}
                                    >
                                        <option value="">-- Choose a service --</option>
                                        {services.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name} • {s.durationMinutes} min</option>
                                        ))}
                                    </select>
                                    {selectedService && (
                                        <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                                            <p className="text-sm text-primary flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                {selectedService.name} ({selectedService.durationMinutes} min)
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Provider Selection */}
                            {serviceId && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <User className="h-4 w-4 text-primary" />
                                            Select Provider
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            value={providerProfileId}
                                            onChange={(e) => {
                                                setProviderProfileId(e.target.value);
                                                setCurrentStep(2);
                                                setSlots([]);
                                                setSelectedStartAt("");
                                                setDate("");
                                                setTime("");
                                            }}
                                        >
                                            <option value="">-- Choose a provider --</option>
                                            {providers.map((p) => (
                                                <option key={p.providerProfileId} value={p.providerProfileId}>{p.name}</option>
                                            ))}
                                        </select>
                                        {selectedProvider && (
                                            <div className="mt-3 space-y-2">
                                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                                                    <p className="text-sm text-primary flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        {selectedProvider.name}
                                                    </p>
                                                </div>
                                                {selectedProvider.bio && (
                                                    <p className="text-sm text-muted-foreground">{selectedProvider.bio}</p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Date Selection */}
                            {serviceId && providerProfileId && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Select Date
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => {
                                                setDate(e.target.value);
                                                setCurrentStep(3);
                                                setSlots([]);
                                                setSelectedStartAt("");
                                                setTime("");
                                            }}
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Time Selection */}
                            {serviceId && providerProfileId && date && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Select Time
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="time"
                                            value={time}
                                            onChange={(e) => {
                                                setTime(e.target.value);
                                                setCurrentStep(4);
                                                setSlots([]);
                                                setSelectedStartAt("");
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Load Slots Button */}
                            {serviceId && providerProfileId && date && time && (
                                <Button onClick={loadSlots} disabled={loading} className="w-full" size="lg">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Loading times...
                                        </>
                                    ) : (
                                        "View Available Slots"
                                    )}
                                </Button>
                            )}

                            {/* Available Slots */}
                            {slots.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                            Available Slots
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                                            {slots.map((slot) => {
                                                const slotDate = new Date(slot);
                                                const slotTime = slotDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setSelectedStartAt(slot)}
                                                        className={`p-3 rounded-xl border-2 font-semibold transition-all text-sm ${selectedStartAt === slot
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border bg-surface text-foreground hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {slotTime}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            onClick={book}
                                            disabled={!selectedStartAt || loading}
                                            variant="success"
                                            className="w-full"
                                            size="lg"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Booking...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Confirm Booking
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Service</p>
                                    <p className="text-sm font-semibold text-foreground">{selectedService?.name || "—"}</p>
                                </div>
                                {selectedService && (
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
                                        <p className="text-sm font-semibold text-foreground">{selectedService.durationMinutes} min</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Provider</p>
                                    <p className="text-sm font-semibold text-foreground">{selectedProvider?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                                    <p className="text-sm font-semibold text-foreground">{date ? new Date(date).toLocaleDateString() : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {selectedStartAt ? new Date(selectedStartAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
