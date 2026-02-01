"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastSuccess, toastError } from "@/lib/toast";
import { Leaf, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

function LoginForm({ nextPath }: { nextPath: string | null }) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
                // User is not authenticated, allow login
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
            const res = await api<{ user: { role: string } }>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            toastSuccess("Login successful!");

            // Dispatch auth change event for Navbar to update
            window.dispatchEvent(new Event("auth-change"));

            // Redirect to the "next" path if provided, otherwise use role-based routing
            if (nextPath) {
                router.push(nextPath);
            } else if (res.user.role === "CUSTOMER") {
                router.push("/customer/book");
            } else if (res.user.role === "PROVIDER") {
                router.push("/provider/availability");
            } else {
                router.push("/admin/services");
            }
        } catch (e) {
            toastError(e, "Login failed");
        } finally {
            setLoading(false);
        }
    }

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
                        <div className="space-y-2 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Leaf className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">Welcome Back</h1>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-sm">Sign in to book your appointments</p>
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
                        <div className="space-y-2 mb-2">
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

                        {/* Forgot Password Link */}
                        <div className="mb-6 text-right">
                            <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                                Forgot password?
                            </a>
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
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        {/* Register Link */}
                        <p className="text-sm text-muted-foreground text-center">
                            Don&apos;t have an account?{" "}
                            <a href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                Create one
                            </a>
                        </p>
                    </div>
                </form>
            )}
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next");
    return <LoginForm nextPath={nextPath} />;
}

