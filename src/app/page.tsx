"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/http";
import { Calendar, Users, Briefcase, Shield, ArrowRight } from "lucide-react";

type Me =
  | { id: string; name: string; role: "CUSTOMER" | "PROVIDER" | "ADMIN" }
  | null;

export default function HomePage() {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ user: Me }>("/api/auth/me");
        setMe(res.user);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dashboard = useMemo(() => {
    if (!me) return null;
    if (me.role === "CUSTOMER")
      return { href: "/customer/book", label: "Go to Booking" };
    if (me.role === "PROVIDER")
      return { href: "/provider/availability", label: "Go to Provider Dashboard" };
    return { href: "/admin/services", label: "Go to Admin Dashboard" };
  }, [me]);

  return (
    <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 dark:bg-slate-950 bg-white">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">BookMe</h1>
          </div>
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
            Book appointments easily. Providers manage availability. Admins control the system.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 hover:border-blue-500/50 transition-all group">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-600/30 transition-colors">
              <Users className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white text-sm sm:text-base mb-2">Customers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Browse services, view time slots, book and cancel appointments.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 hover:border-purple-500/50 transition-all group">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-600/30 transition-colors">
              <Briefcase className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white text-sm sm:text-base mb-2">Providers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Create availability, manage bookings, mark sessions completed.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 hover:border-green-500/50 transition-all group sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-600/30 transition-colors">
              <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Admins</h3>
            <p className="text-sm text-slate-400">
              Manage services, approve providers, monitor the system.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
          {loading ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : me && dashboard ? (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-sm sm:text-base text-slate-300 mb-1">You are logged in as</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-blue-400">
                  {me.name} <span className="text-slate-400">({me.role})</span>
                </p>
              </div>

              <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded transition-colors">
                <Link href={dashboard.href}>{dashboard.label}</Link>
              </Button>

              <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-2">
                <ArrowRight className="w-3 h-3" /> Tip: use the navbar above to navigate quickly
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-slate-300">Get started now</p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 px-6 sm:px-8 rounded transition-colors">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild className="border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500 font-semibold py-2 sm:py-2.5 px-6 sm:px-8 rounded transition-all">
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
