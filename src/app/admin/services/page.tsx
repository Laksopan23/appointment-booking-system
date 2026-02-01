"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Plus, Pencil, Trash2, RotateCcw, Clock, Loader2 } from "lucide-react";
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
        } catch {
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
    }

    function cancelEdit() {
        setEditingId(null);
    }

    async function saveEdit(id: string) {
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
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
            <div className="space-y-6">

                {/* Create Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Create Service
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Name *</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Consultation"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Duration (min) *</label>
                                <Input
                                    type="number"
                                    min="5"
                                    max="240"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-3">
                                <label className="text-sm font-medium text-foreground">Description (optional)</label>
                                <Input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the service"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={createService}
                            disabled={!name.trim() || durationMinutes < 5 || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Service
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Services List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            Services
                            <span className="text-sm font-normal text-muted-foreground">({services.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {services.length === 0 ? (
                            <EmptyState
                                icon={<Settings className="w-10 h-10" />}
                                title="No services yet"
                                description="Create your first service above to start accepting bookings"
                            />
                        ) : (
                            <div className="space-y-3">
                                {services.map((s) => (
                                    <div
                                        key={s.id}
                                        className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
                                    >
                                        {editingId === s.id ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">Name</label>
                                                        <Input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">Duration</label>
                                                        <Input
                                                            type="number"
                                                            min="5"
                                                            max="240"
                                                            value={editDuration}
                                                            onChange={(e) => setEditDuration(Number(e.target.value))}
                                                        />
                                                    </div>

                                                    <div className="space-y-2 md:col-span-3">
                                                        <label className="text-sm font-medium text-foreground">Description</label>
                                                        <Input
                                                            value={editDescription}
                                                            onChange={(e) => setEditDescription(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => saveEdit(s.id)}
                                                        disabled={!editName.trim() || editDuration < 5 || loading}
                                                        size="sm"
                                                    >
                                                        {loading ? "Saving..." : "Save Changes"}
                                                    </Button>
                                                    <Button
                                                        onClick={cancelEdit}
                                                        disabled={loading}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-foreground">{s.name}</span>
                                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {s.durationMinutes} min
                                                        </span>
                                                        <span className={s.deletedAt ? 'badge-destructive' : 'badge-success'}>
                                                            {s.deletedAt ? "Deleted" : "Active"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {s.description || "No description"}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2 flex-shrink-0">
                                                    <Button
                                                        onClick={() => startEdit(s)}
                                                        disabled={loading || !!s.deletedAt}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => toggleService(s)}
                                                        disabled={loading}
                                                        variant={s.deletedAt ? "outline" : "destructive"}
                                                        size="sm"
                                                    >
                                                        {s.deletedAt ? (
                                                            <>
                                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                                Restore
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="h-4 w-4 mr-1" />
                                                                Deactivate
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageShell>
    );
}
