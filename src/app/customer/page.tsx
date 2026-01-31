"use client";

import Link from "next/link";

export default function CustomerDashboard() {
    return (
        <main className="min-h-screen p-4 sm:p-6 lg:p-8 dark:bg-slate-950 bg-white">
            <div className="relative max-w-5xl mx-auto">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-xl sm:text-2xl">👤</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-white text-slate-900">
                            Customer Dashboard
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Book Appointment Card */}
                        <Link href="/customer/book">
                            <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 hover:dark:border-slate-700 hover:border-slate-300 transition-all cursor-pointer h-full border">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg">📋</span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900">Book Appointment</h2>
                                </div>
                                <p className="dark:text-slate-400 text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
                                    Schedule a new appointment with available providers
                                </p>
                                <span className="inline-block dark:text-green-400 text-green-600 text-xs sm:text-sm font-medium">
                                    Start Booking →
                                </span>
                            </div>
                        </Link>

                        {/* My Bookings Card */}
                        <Link href="/customer/bookings">
                            <div className="dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 rounded-lg p-4 sm:p-6 hover:dark:border-slate-700 hover:border-slate-300 transition-all cursor-pointer h-full border">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg">📅</span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900">My Bookings</h2>
                                </div>
                                <p className="dark:text-slate-400 text-slate-600 text-sm mb-4">
                                    View and manage your appointment bookings
                                </p>
                                <span className="inline-block dark:text-emerald-400 text-emerald-600 text-sm font-medium">
                                    View Bookings →
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
