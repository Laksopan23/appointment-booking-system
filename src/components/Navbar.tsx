"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Clock, BarChart3, Settings, Users, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type Me = { id: string; name: string; role: "CUSTOMER" | "PROVIDER" | "ADMIN" } | null;

export default function Navbar() {
    const [me, setMe] = useState<Me>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    async function loadMe() {
        try {
            const res = await api<{ user: Me }>("/api/auth/me");
            setMe(res.user);
        } catch {
            setMe(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMe();
    }, []);

    async function logout() {
        try {
            await api("/api/auth/logout", { method: "POST" });
            window.location.href = "/auth/login";
        } catch (e) {
            console.error("Logout failed:", e);
        }
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-foreground">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>BookMe</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {me?.role === "CUSTOMER" && (
                            <>
                                <Link
                                    href="/customer/book"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Book
                                </Link>
                                <Link
                                    href="/customer/bookings"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    My Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "PROVIDER" && (
                            <>
                                <Link
                                    href="/provider/availability"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <Clock className="w-4 h-4" />
                                    Availability
                                </Link>
                                <Link
                                    href="/provider/bookings"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "ADMIN" && (
                            <>
                                <Link
                                    href="/admin/services"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Services
                                </Link>
                                <Link
                                    href="/admin/providers"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <Users className="w-4 h-4" />
                                    Providers
                                </Link>
                                <Link
                                    href="/admin/audit"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    <Shield className="w-4 h-4" />
                                    Audit Logs
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {!loading && (
                            <>
                                {me ? (
                                    <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
                                        <div className="text-right text-sm">
                                            <p className="font-medium text-foreground">{me.name}</p>
                                            <p className="text-xs text-muted-foreground">{me.role}</p>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={logout}>
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href="/auth/login">Login</Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href="/auth/register">Register</Link>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            <span className="text-xl">{isOpen ? "✕" : "☰"}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2 border-t border-border animate-slideDown">
                        {me?.role === "CUSTOMER" && (
                            <>
                                <Link
                                    href="/customer/book"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    📋 Book
                                </Link>
                                <Link
                                    href="/customer/bookings"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    📅 My Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "PROVIDER" && (
                            <>
                                <Link
                                    href="/provider/availability"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    ⏰ Availability
                                </Link>
                                <Link
                                    href="/provider/bookings"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    📊 Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "ADMIN" && (
                            <>
                                <Link
                                    href="/admin/services"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    ⚙️ Services
                                </Link>
                                <Link
                                    href="/admin/providers"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    👥 Providers
                                </Link>
                                <Link
                                    href="/admin/audit"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                    🔒 Audit Logs
                                </Link>
                            </>
                        )}

                        {!loading && me && (
                            <Button
                                variant="destructive"
                                className="w-full mt-2"
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                            >
                                Logout
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
