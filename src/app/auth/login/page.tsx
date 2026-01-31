"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastSuccess, toastError } from "@/lib/toast";

function LoginForm({ nextPath }: { nextPath: string | null }) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [focused, setFocused] = useState<string | null>(null);
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
        <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 dark:bg-slate-950 bg-white relative overflow-hidden">
            {/* Show loading state while checking auth */}
            {isChecking && (
                <div className="fixed inset-0 dark:bg-slate-950/50 bg-white/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
            )}

            {!isChecking && (
                <>
                    <form onSubmit={onSubmit} className="relative w-full max-w-md">
                        <div className="dark:bg-gradient-to-b dark:from-slate-800/50 dark:to-slate-900/50 bg-slate-50 dark:backdrop-blur-xl dark:border dark:border-slate-700/50 border border-slate-200 rounded-2xl p-6 sm:p-8 dark:shadow-2xl shadow-lg">
                            {/* Header */}
                            <div className="space-y-2 mb-8">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">A</span>
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900">Welcome Back</h1>
                                </div>
                                <p className="dark:text-slate-400 text-slate-600 text-xs sm:text-sm">Sign in to book your appointments</p>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <label className="text-xs sm:text-sm font-semibold text-slate-200 block">Email Address</label>
                                <div className="relative group">
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="you@example.com"
                                        type="email"
                                        required
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-white dark:border transition-all duration-300 text-sm dark:text-white text-slate-900 placeholder:dark:text-slate-500 placeholder:text-slate-400 ${focused === 'email'
                                            ? 'border-blue-500 dark:shadow-lg dark:shadow-blue-500/20'
                                            : 'dark:border-slate-700 border-slate-200 dark:hover:border-slate-600 hover:border-slate-300'
                                            }`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-600 text-sm">📧</div>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2 sm:space-y-3 mb-2">
                                <label className="text-xs sm:text-sm font-semibold dark:text-slate-200 text-slate-700 block">Password</label>
                                <div className="relative group">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="••••••••"
                                        required
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg dark:bg-slate-800 bg-white dark:border transition-all duration-300 text-sm dark:text-white text-slate-900 placeholder:dark:text-slate-500 placeholder:text-slate-400 ${focused === 'password'
                                            ? 'border-blue-500 dark:bg-slate-700 dark:shadow-lg dark:shadow-blue-500/20'
                                            : 'dark:border-slate-600 border-slate-200 dark:hover:border-slate-500 hover:border-slate-300'
                                            }`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-600 text-sm">🔒</div>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="mb-6 text-right">
                                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                            </div>

                            {/* Error Message */}
                            {err && (
                                <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700/50 animate-slideDown">
                                    <p className="text-sm text-red-300 flex items-start gap-2">
                                        <span>⚠️</span>
                                        <span>{err}</span>
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            {/* Register Link */}
                            <p className="text-sm text-slate-400 text-center">
                                Don't have an account?{" "}
                                <a href="/auth/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200">
                                    Create one
                                </a>
                            </p>
                        </div>
                    </form>
                </>
            )}
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next");
    return <LoginForm nextPath={nextPath} />;
}

