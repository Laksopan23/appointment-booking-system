"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/http";
import {
  Calendar,
  Users,
  Briefcase,
  Shield,
  ArrowRight,
  Leaf,
  Clock,
  CheckCircle2,
  Sparkles
} from "lucide-react";

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
      return { href: "/customer/book", label: "Book an Appointment" };
    if (me.role === "PROVIDER")
      return { href: "/provider/availability", label: "Manage Availability" };
    return { href: "/admin/services", label: "Go to Dashboard" };
  }, [me]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Book Appointments
              <span className="block text-primary">Effortlessly</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern scheduling platform for customers, providers, and administrators.
              Simple, fast, and beautifully designed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Loading...
                </div>
              ) : me && dashboard ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground">
                    Welcome back, <span className="font-medium text-foreground">{me.name}</span>
                  </p>
                  <Button asChild size="lg" className="gap-2">
                    <Link href={dashboard.href}>
                      {dashboard.label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/auth/register">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Built for Everyone
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re booking appointments, managing your schedule, or overseeing operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Card */}
            <Card className="group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">For Customers</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Browse services, view available time slots, and book appointments in seconds.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Easy booking flow
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    View & manage bookings
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Cancel anytime
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card className="group hover:border-accent/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">For Providers</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Set your availability, manage appointments, and grow your business.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Flexible scheduling
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Booking management
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Track completions
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="group hover:border-success/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">For Admins</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Full control over services, providers, and system monitoring.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Service management
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Provider approvals
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Audit logs
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">Easy</p>
              <p className="text-sm text-muted-foreground">Booking</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mx-auto mb-3">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">Fast</p>
              <p className="text-sm text-muted-foreground">Scheduling</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 mx-auto mb-3">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">Secure</p>
              <p className="text-sm text-muted-foreground">Platform</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-warning/10 mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-warning" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">Modern</p>
              <p className="text-sm text-muted-foreground">Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join BookMe today and experience the easiest way to manage appointments.
          </p>
          {!me && !loading && (
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/register">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
