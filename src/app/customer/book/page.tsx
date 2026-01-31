"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";
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
    const [msg, setMsg] = useState<string | null>(null);
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
            } catch (e: any) {
                setMsg("Failed to load data");
            } finally {
                setInitialLoad(false);
            }
        })();
    }, []);

    async function loadSlots() {
        setMsg(null);
        setSlots([]);
        setSelectedStartAt("");
        if (!providerProfileId || !serviceId || !date || !time) {
            setMsg("Select service, provider, date and time first");
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
                setMsg("No available slots for this date/time. Try another time.");
            }
        } catch (e: any) {
            setMsg("Failed to load slots");
        } finally {
            setLoading(false);
        }
    }

    async function book() {
        setMsg(null);
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
            <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between mb-2 sm:mb-3 gap-1">
                    {["Service", "Provider", "Date", "Time", "Confirm"].map((label, i) => (
                        <div key={i} className="text-center flex-1">
                            <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-semibold transition-all text-xs sm:text-sm mx-auto ${currentStep > i + 1 ? 'bg-green-600 text-white' : currentStep === i + 1 ? 'bg-blue-600 text-white scale-110' : 'dark:bg-slate-700 bg-slate-300 dark:text-slate-400 text-slate-600'}`}>
                                {i + 1}
                            </div>
                            <p className="text-xs dark:text-slate-400 text-slate-600 mt-1 hidden sm:block">{label}</p>
                        </div>
                    ))}
                </div>
                <div className="w-full h-1 dark:bg-slate-700 bg-slate-300 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500 rounded-full" style={{ width: `${(currentStep / 5) * 100}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {initialLoad ? (
                        <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-6 sm:p-8 text-center border">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                            <p className="dark:text-slate-300 text-slate-700 text-sm sm:text-base">Loading services...</p>
                        </div>
                    ) : (
                        <>
                            <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 border">
                                <label className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <span className="text-lg">📋</span>
                                    Select Service
                                </label>
                                <select className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border" value={serviceId} onChange={(e) => { setServiceId(e.target.value); setCurrentStep(1); setSlots([]); setSelectedStartAt(""); setDate(""); setTime(""); }}>
                                    <option value="">-- Choose --</option>
                                    {services.map((s) => <option key={s.id} value={s.id}>{s.name} • {s.durationMinutes}min</option>)}
                                </select>
                                {selectedService && <div className="mt-3 p-2 sm:p-3 dark:bg-blue-900/30 bg-blue-50 dark:border-blue-700/50 border-blue-200 rounded-lg border"><p className="text-xs sm:text-sm dark:text-blue-300 text-blue-700">✓ {selectedService.name}</p></div>}
                            </div>

                            {serviceId && <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 border">
                                <label className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 mb-3 sm:mb-4 flex items-center gap-2"><span className="text-lg">👤</span>Select Provider</label>
                                <select className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border" value={providerProfileId} onChange={(e) => { setProviderProfileId(e.target.value); setCurrentStep(2); setSlots([]); setSelectedStartAt(""); setDate(""); setTime(""); }}>
                                    <option value="">-- Choose --</option>
                                    {providers.map((p) => <option key={p.providerProfileId} value={p.providerProfileId}>{p.name}</option>)}
                                </select>
                                {selectedProvider && <div className="mt-3 space-y-2"><div className="p-2 sm:p-3 dark:bg-blue-900/30 bg-blue-50 dark:border-blue-700/50 border-blue-200 rounded-lg border"><p className="text-xs sm:text-sm dark:text-blue-300 text-blue-700">✓ {selectedProvider.name}</p></div>{selectedProvider.bio && <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">{selectedProvider.bio}</p>}</div>}
                            </div>}

                            {serviceId && providerProfileId && <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 border">
                                <label className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 mb-3 sm:mb-4 flex items-center gap-2"><span className="text-lg">📅</span>Select Date</label>
                                <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setCurrentStep(3); setSlots([]); setSelectedStartAt(""); setTime(""); }} min={new Date().toISOString().split("T")[0]} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 text-sm border" />
                            </div>}

                            {serviceId && providerProfileId && date && <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 border">
                                <label className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 mb-3 sm:mb-4 flex items-center gap-2"><span className="text-lg">⏰</span>Select Time</label>
                                <Input type="time" value={time} onChange={(e) => { setTime(e.target.value); setCurrentStep(4); setSlots([]); setSelectedStartAt(""); }} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 text-sm border" />
                            </div>}

                            {serviceId && providerProfileId && date && time && <Button onClick={loadSlots} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-70 text-sm">
                                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading times...</span> : "View Available Slots"}
                            </Button>}
                        </>
                    )}

                    {slots.length > 0 && <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 border">
                        <label className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 mb-3 sm:mb-4 flex items-center gap-2"><span className="text-lg">✓</span>Confirmed Slots</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4 sm:mb-6">
                            {slots.map((slot, idx) => {
                                const slotDate = new Date(slot);
                                const slotTime = slotDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                                return <button key={slot} onClick={() => setSelectedStartAt(slot)} className={`p-2 sm:p-3 rounded-lg border-2 font-semibold transition-all duration-300 text-xs sm:text-sm ${selectedStartAt === slot ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/50' : 'dark:border-slate-600 border-slate-300 dark:bg-slate-800 bg-slate-100 dark:text-slate-200 text-slate-700 hover:dark:border-blue-500 hover:border-blue-500'}`}>{slotTime}</button>;
                            })}
                        </div>
                        <Button onClick={book} disabled={!selectedStartAt || loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm">
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Booking...</span> : "Confirm"}
                        </Button>
                    </div>}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4 border">
                            <h3 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900">📝 Summary</h3>
                            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                <div><p className="dark:text-slate-400 text-slate-600">Service</p><p className="dark:text-white text-slate-900 font-semibold text-sm">{selectedService?.name || "—"}</p></div>
                                {selectedService && <div><p className="dark:text-slate-400 text-slate-600">Duration</p><p className="dark:text-white text-slate-900 font-semibold text-sm">{selectedService.durationMinutes} min</p></div>}
                                <div><p className="dark:text-slate-400 text-slate-600">Provider</p><p className="dark:text-white text-slate-900 font-semibold text-sm">{selectedProvider?.name || "—"}</p></div>
                                <div><p className="dark:text-slate-400 text-slate-600">Date</p><p className="dark:text-white text-slate-900 font-semibold text-sm">{date ? new Date(date).toLocaleDateString() : "—"}</p></div>
                                <div><p className="dark:text-slate-400 text-slate-600">Time</p><p className="dark:text-white text-slate-900 font-semibold text-sm">{selectedStartAt ? new Date(selectedStartAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {msg && <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md p-3 sm:p-4 rounded-lg border text-xs sm:text-sm ${msg.includes("✅") ? 'dark:bg-green-900/30 bg-green-50 dark:text-green-300 text-green-700 dark:border-green-700/50 border-green-200' : 'dark:bg-amber-900/30 bg-amber-50 dark:text-amber-300 text-amber-700 dark:border-amber-700/50 border-amber-200'}`}><p className="font-semibold">{msg}</p></div>}
            </div>
        </PageShell>
    );
}
