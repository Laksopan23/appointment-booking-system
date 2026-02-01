"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    BookOpen,
    Clock,
    BarChart3,
    Settings,
    Users,
    Shield,
    LogOut,
    Menu,
    X,
    Leaf
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type Me = { id: string; name: string; role: "CUSTOMER" | "PROVIDER" | "ADMIN" } | null;

export default function Navbar() {
    const [me, setMe] = useState<Me>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

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

        // Listen for auth state changes (login/logout)
        const handleAuthChange = () => loadMe();
        window.addEventListener("auth-change", handleAuthChange);

        return () => window.removeEventListener("auth-change", handleAuthChange);
    }, []);

    async function logout() {
        try {
            await api("/api/auth/logout", { method: "POST" });
            window.location.href = "/auth/login";
        } catch (e) {
            console.error("Logout failed:", e);
        }
    }

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    const navLinkClass = (path: string) =>
        `inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(path)
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`;

    const mobileNavLinkClass = (path: string) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(path)
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`;

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-destructive/15 text-destructive";
            case "PROVIDER":
                return "bg-primary/15 text-primary";
            case "CUSTOMER":
                return "bg-accent/15 text-accent";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 font-bold text-xl text-foreground hover:text-primary transition-colors"
                    >
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                            <Leaf className="w-5 h-5 text-primary" />
                        </div>
                        <span className="hidden sm:inline">BookMe</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {me?.role === "CUSTOMER" && (
                            <>
                                <Link href="/customer/book" className={navLinkClass("/customer/book")}>
                                    <BookOpen className="w-4 h-4" />
                                    Book
                                </Link>
                                <Link href="/customer/bookings" className={navLinkClass("/customer/bookings")}>
                                    <Calendar className="w-4 h-4" />
                                    My Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "PROVIDER" && (
                            <>
                                <Link href="/provider/availability" className={navLinkClass("/provider/availability")}>
                                    <Clock className="w-4 h-4" />
                                    Availability
                                </Link>
                                <Link href="/provider/bookings" className={navLinkClass("/provider/bookings")}>
                                    <BarChart3 className="w-4 h-4" />
                                    Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "ADMIN" && (
                            <>
                                <Link href="/admin/services" className={navLinkClass("/admin/services")}>
                                    <Settings className="w-4 h-4" />
                                    Services
                                </Link>
                                <Link href="/admin/providers" className={navLinkClass("/admin/providers")}>
                                    <Users className="w-4 h-4" />
                                    Providers
                                </Link>
                                <Link href="/admin/audit" className={navLinkClass("/admin/audit")}>
                                    <Shield className="w-4 h-4" />
                                    Audit Logs
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {!loading && (
                            <>
                                {me ? (
                                    <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-border">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-foreground leading-tight">{me.name}</p>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded ${getRoleBadgeClass(me.role)}`}>
                                                {me.role}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={logout}
                                            className="border-border text-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="hidden sm:flex items-center gap-2 ml-2">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href="/auth/login">Login</Link>
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href="/auth/register">Get Started</Link>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 space-y-1 border-t border-border animate-slideDown">
                        {!me && !loading && (
                            <div className="flex gap-2 mb-4 px-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>Login</Link>
                                </Button>
                                <Button asChild size="sm" className="flex-1">
                                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                                </Button>
                            </div>
                        )}

                        {me?.role === "CUSTOMER" && (
                            <>
                                <Link href="/customer/book" onClick={() => setIsOpen(false)} className={mobileNavLinkClass("/customer/book")}>
                                    <BookOpen className="w-5 h-5" />
                                    Book Appointment
                                </Link>
                                <Link href="/customer/bookings" onClick={() => setIsOpen(false)} className={mobileNavLinkClass("/customer/bookings")}>
                                    <Calendar className="w-5 h-5" />
                                    My Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "PROVIDER" && (
                            <>
                                <Link href="/provider/availability" onClick={() => setIsOpen(false)} className={mobileNavLinkClass("/provider/availability")}>
                                    <Clock className="w-5 h-5" />
                                    Manage Availability
                                </Link>
                                <Link href="/provider/bookings" onClick={() => setIsOpen(false)} className={mobileNavLinkClass("/provider/bookings")}>
                                    <BarChart3 className="w-5 h-5" />
                                    My Bookings
                                </Link>
                            </>
                        )}

                        {me?.role === "ADMIN" && (
                            <>
                                <Link href="/admin/services" onClick={() => setIsOpen(false)} className={mobileNavLinkClass("/admin/services")}>
                                    <Settings className="w-5 h-5" />
                                    Services
                                </Link>
                                <Link href="/admin/providers" onClick={() => setIsOpen(false)} className={mobileNavLinkClass("/admin/providers")}>
                                    <Users className="w-5 h-5" />
                                    Providers
                                </Link>
                                <Link href="/admin/audit" onClick={() => setIsOpen(false)} className={mobileNavLinkClass("/admin/audit")}>
                                    <Shield className="w-5 h-5" />
                                    Audit Logs
                                </Link>
                            </>
                        )}

                        {me && (
                            <div className="pt-4 mt-4 border-t border-border">
                                <div className="flex items-center justify-between px-4 py-2">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{me.name}</p>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded ${getRoleBadgeClass(me.role)}`}>
                                            {me.role}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}
                                        className="text-destructive hover:bg-destructive/10"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
