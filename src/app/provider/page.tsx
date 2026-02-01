"use client";

import Link from "next/link";
import { Clock, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProviderDashboard() {
    return (
        <main className="min-h-screen bg-background">
            <div className="page-container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/15 rounded-xl flex items-center justify-center">
                            <span className="text-xl sm:text-2xl">👨‍⚕️</span>
                        </div>
                        <div>
                            <h1 className="page-title">Provider Dashboard</h1>
                            <p className="page-description">Manage availability and bookings</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Manage Availability Card */}
                    <Link href="/provider/availability">
                        <Card className="aurora-card-hover h-full">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-foreground">Availability</h2>
                                </div>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Set your working hours and available time slots
                                </p>
                                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                                    Manage Availability →
                                </span>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* My Bookings Card */}
                    <Link href="/provider/bookings">
                        <Card className="aurora-card-hover h-full">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-accent" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-foreground">My Bookings</h2>
                                </div>
                                <p className="text-muted-foreground text-sm mb-4">
                                    Accept, complete, or cancel customer bookings
                                </p>
                                <span className="inline-flex items-center gap-1 text-accent text-sm font-medium">
                                    View Bookings →
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </main>
    );
}
