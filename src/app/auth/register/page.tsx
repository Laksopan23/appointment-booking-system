"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastSuccess, toastError } from "@/lib/toast";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
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

    return (
        <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 dark:bg-slate-950 bg-white relative overflow-hidden">
            {/* Show loading state while checking auth */}
            {isChecking && (
                <div className="fixed inset-0 dark:bg-slate-950/50 bg-white/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            )}

            {!isChecking && (
                <>
                    <form onSubmit={onSubmit} className="relative w-full max-w-md">
                        <div className="dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 dark:shadow-xl shadow-lg border">
                            {/* Header */}
                            <div className="space-y-2 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">+</span>
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900">Join Us</h1>
                                </div>
                                <p className="dark:text-slate-400 text-slate-600 text-sm">Create your account to get started</p>
                            </div>

                            {/* Step Indicator */}
                            <div className="flex gap-1 mb-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= (name && email && password ? 3 : name && email ? 2 : name ? 1 : 0)
                                        ? 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                        : 'dark:bg-slate-700 bg-slate-300'
                                        }`} />
                                ))}
                            </div>

                            {/* Name Field */}
                            <div className="space-y-3 mb-6">
                                <label className="text-sm font-semibold text-slate-200 block">Full Name</label>
                                <div className="relative">
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocused('name')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="John Doe"
                                        required
                                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 ${focused === 'name'
                                            ? 'border-indigo-500 bg-slate-700 shadow-lg shadow-indigo-500/20'
                                            : 'border-slate-600 hover:border-slate-500'
                                            } text-white placeholder:text-slate-500`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">👤</div>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-3 mb-6">
                                <label className="text-sm font-semibold text-slate-200 block">Email Address</label>
                                <div className="relative">
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="you@example.com"
                                        type="email"
                                        required
                                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 ${focused === 'email'
                                            ? 'border-indigo-500 bg-slate-700 shadow-lg shadow-indigo-500/20'
                                            : 'border-slate-600 hover:border-slate-500'
                                            } text-white placeholder:text-slate-500`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">📧</div>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-3 mb-6">
                                <label className="text-sm font-semibold text-slate-200 block">Password</label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused(null)}
                                        placeholder="••••••••"
                                        required
                                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 ${focused === 'password'
                                            ? 'border-indigo-500 bg-slate-700 shadow-lg shadow-indigo-500/20'
                                            : 'border-slate-600 hover:border-slate-500'
                                            } text-white placeholder:text-slate-500`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-3 mb-6">
                                <label className="text-sm font-semibold text-slate-200 block">I am a</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "CUSTOMER", label: "Customer", icon: "🛍️" },
                                        { value: "PROVIDER", label: "Provider", icon: "⭐" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setRole(opt.value as any)}
                                            className={`p-3 rounded-lg border-2 transition-all duration-300 transform ${role === opt.value
                                                ? 'border-indigo-500 bg-indigo-900/30 shadow-lg shadow-indigo-500/20 scale-105'
                                                : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{opt.icon}</div>
                                            <div className="text-sm font-semibold text-white">{opt.label}</div>
                                        </button>
                                    ))}
                                </div>
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
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>

                            {/* Login Link */}
                            <p className="text-sm text-slate-400 text-center">
                                Already have an account?{" "}
                                <a href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200">
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </form>
                </>
            )}
        </main>
    );
}
