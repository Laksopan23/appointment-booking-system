"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Settings } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { useRouter } from "next/navigation";

type Service = {
    id: string;
    name: string;
    description?: string | null;
    durationMinutes: number;
    active: boolean;
    deletedAt?: string | null;
};

type Me = { id: string; name: string; role: "CUSTOMER" | "PROVIDER" | "ADMIN" } | null;

export default function AdminServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [me, setMe] = useState<Me>(null);
    const [checking, setChecking] = useState(true);

    // Create form
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [durationMinutes, setDurationMinutes] = useState<number>(30);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDuration, setEditDuration] = useState<number>(30);

    async function load() {
        try {
            const res = await api<{ services: Service[] }>("/api/admin/services");
            setServices(res.services);
        } catch (e) {
            toastError(e, "Failed to load services");
        }
    }

    async function checkAuth() {
        try {
            const res = await api<{ user: Me }>("/api/auth/me");
            setMe(res.user);
            if (!res.user || res.user.role !== "ADMIN") {
                router.replace("/");
            }
        } catch (e) {
            router.replace("/auth/login");
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!checking && me?.role === "ADMIN") {
            load();
        }
    }, [checking, me]);

    async function createService() {
        setMsg(null);
        if (!name.trim() || durationMinutes < 5) {
            toastError("Name required, duration must be ≥ 5 min");
            return;
        }
        try {
            setLoading(true);
            await api("/api/services", {
                method: "POST",
                body: JSON.stringify({ name, description, durationMinutes }),
            });
            setName("");
            setDescription("");
            setDurationMinutes(30);
            toastSuccess("Service created");
            await load();
        } catch (e) {
            toastError(e, "Failed to create service");
        } finally {
            setLoading(false);
        }
    }

    function startEdit(s: Service) {
        setEditingId(s.id);
        setEditName(s.name);
        setEditDescription(s.description ?? "");
        setEditDuration(s.durationMinutes);
        setMsg(null);
    }

    function cancelEdit() {
        setEditingId(null);
        setMsg(null);
    }

    async function saveEdit(id: string) {
        setMsg(null);
        if (!editName.trim() || editDuration < 5) {
            toastError("Name required, duration must be ≥ 5 min");
            return;
        }
        try {
            setLoading(true);
            await api(`/api/services/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: editName,
                    description: editDescription,
                    durationMinutes: editDuration,
                }),
            });
            setEditingId(null);
            toastSuccess("Service updated");
            await load();
        } catch (e) {
            toastError(e, "Failed to update service");
        } finally {
            setLoading(false);
        }
    }

    async function toggleService(service: Service) {
        setMsg(null);
        const isDeleted = service.deletedAt !== null;
        const action = isDeleted ? "restore" : "deactivate";

        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this service?`)) return;
        try {
            setLoading(true);
            await api(`/api/services/${service.id}`, { method: "DELETE" });
            toastSuccess(isDeleted ? "Service restored" : "Service deactivated");
            await load();
        } catch (e) {
            toastError(e, `Failed to ${action} service`);
        } finally {
            setLoading(false);
        }
    }

    // Show loading state while checking auth
    if (checking) {
        return (
            <PageShell title="Services" description="Loading...">
                <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">Checking authorization...</p>
                </div>
            </PageShell>
        );
    }

    // Redirect handled by useEffect, but show error just in case
    if (!me || me.role !== "ADMIN") {
        return (
            <PageShell title="Access Denied" description="">
                <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">You do not have permission to access this page.</p>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell
            title="Services"
            description="Create, update, and manage appointment services"
        >
            <div className="space-y-4 sm:space-y-6">

                {/* Create Section */}
                <section className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm dark:shadow-black/20">
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-3 sm:mb-4">Create Service</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-muted-foreground">Name *</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Consultation"
                                className="text-xs sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-muted-foreground">Duration (min) *</label>
                            <Input
                                type="number"
                                min="5"
                                max="240"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                className="text-xs sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-3">
                            <label className="text-xs sm:text-sm font-medium text-muted-foreground">Description (optional)</label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the service"
                                className="text-xs sm:text-sm"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={createService}
                        disabled={!name.trim() || durationMinutes < 5 || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded transition-colors disabled:opacity-50 text-xs sm:text-sm"
                    >
                        {loading ? "Creating..." : "Create Service"}
                    </Button>
                </section>

                {/* Services List */}
                <section className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm dark:shadow-black/20">
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-3 sm:mb-4">
                        Services ({services.length})
                    </h3>

                    {services.length === 0 ? (
                        <EmptyState
                            icon={<Settings className="w-10 h-10" />}
                            title="No services yet"
                            description="Create your first service above to start accepting bookings"
                        />
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {services.map((s) => (
                                <div key={s.id} className="bg-secondary border border-border rounded-lg p-4 hover:border-primary/50 transition-all shadow-sm dark:shadow-black/20">
                                    {editingId === s.id ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className=""
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                                    <Input
                                                        type="number"
                                                        min="5"
                                                        max="240"
                                                        value={editDuration}
                                                        onChange={(e) => setEditDuration(Number(e.target.value))}
                                                        className=""
                                                    />
                                                </div>

                                                <div className="space-y-2 md:col-span-3">
                                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                                    <Input
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        className=""
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => saveEdit(s.id)}
                                                    disabled={!editName.trim() || editDuration < 5 || loading}
                                                    className=""
                                                >
                                                    {loading ? "Saving..." : "Save"}
                                                </Button>
                                                <Button
                                                    onClick={cancelEdit}
                                                    disabled={loading}
                                                    variant="outline"
                                                    className=""
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="font-semibold text-foreground">
                                                    {s.name} <span className="text-sm text-muted-foreground font-normal">({s.durationMinutes} min)</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">{s.description || "—"}</div>
                                                <div className="text-xs mt-2 flex items-center gap-2">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className={`h-2 w-2 rounded-full ${s.deletedAt ? "bg-red-500/60" : "bg-emerald-500/80"}`} />
                                                        <span className={s.deletedAt ? "text-red-600 dark:text-red-400 font-medium" : "text-emerald-600 dark:text-emerald-400 font-medium"}>
                                                            {s.deletedAt ? "Deleted" : "Active"}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 flex-shrink-0">
                                                <Button
                                                    onClick={() => startEdit(s)}
                                                    disabled={loading || !!s.deletedAt}
                                                    className="text-sm"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => toggleService(s)}
                                                    disabled={loading}
                                                    variant={s.deletedAt ? "outline" : "destructive"}
                                                    className={`text-sm ${!s.deletedAt ? "dark:bg-red-600/80 dark:hover:bg-red-600" : ""}`}
                                                >
                                                    {s.deletedAt ? "Restore" : "Deactivate"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PageShell>
    );
}
