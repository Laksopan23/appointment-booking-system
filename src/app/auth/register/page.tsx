"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastSuccess, toastError } from "@/lib/toast";
import { Leaf, User, Mail, Lock, ShoppingBag, Star, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    // Check if user is already authenticated
    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await api<{ user: { role: string } }>("/api/auth/me");
                // User is authenticated, redirect to dashboard
                if (res.user.role === "CUSTOMER") router.push("/customer/book");
                else if (res.user.role === "PROVIDER") router.push("/provider/availability");
                else if (res.user.role === "ADMIN") router.push("/admin/services");
            } catch {
                // User is not authenticated, allow registration
                setIsChecking(false);
            }
        }
        checkAuth();
    }, [router]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            await api("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password, role }),
            });
            toastSuccess("Account created! Redirecting to login...");
            setTimeout(() => {
                router.push("/auth/login");
            }, 1500);
        } catch (e) {
            toastError(e, "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    // Progress calculation for step indicator
    const progress = name && email && password ? 4 : name && email ? 3 : name ? 2 : 1;

    return (
        <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
            {/* Aurora Mint Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            {/* Show loading state while checking auth */}
            {isChecking && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!isChecking && (
                <form onSubmit={onSubmit} className="relative w-full max-w-md z-10">
                    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-lg">
                        {/* Header */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Leaf className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">Join Us</h1>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-sm">Create your account to get started</p>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= progress ? 'bg-primary' : 'bg-muted'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Name Field */}
                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium text-foreground block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium text-foreground block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    type="email"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium text-foreground block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2 mb-6">
                            <label className="text-sm font-medium text-foreground block">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: "CUSTOMER", label: "Customer", Icon: ShoppingBag },
                                    { value: "PROVIDER", label: "Provider", Icon: Star }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setRole(opt.value as "CUSTOMER" | "PROVIDER")}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${role === opt.value
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border bg-surface hover:border-primary/50'
                                            }`}
                                    >
                                        <opt.Icon className={`h-6 w-6 mx-auto mb-2 ${role === opt.value ? 'text-primary' : 'text-muted-foreground'
                                            }`} />
                                        <div className={`text-sm font-semibold ${role === opt.value ? 'text-foreground' : 'text-muted-foreground'
                                            }`}>
                                            {opt.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {err && (
                            <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{err}</span>
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mb-4"
                            size="lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        {/* Login Link */}
                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{" "}
                            <a href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                Sign in
                            </a>
                        </p>
                    </div>
                </form>
            )}
        </main>
    );
}
