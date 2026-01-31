export default function AdminHome() {
    return (
        <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6 dark:bg-slate-950 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Manage services, providers, and monitor system activity</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Services Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 hover:border-slate-700 transition-all group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                                <span className="text-lg">⚙️</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-white">Services</h2>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">
                            Create, update, and manage appointment services
                        </p>
                        <a
                            href="/admin/services"
                            className="inline-block px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs sm:text-sm transition-colors"
                        >
                            Manage Services →
                        </a>
                    </div>

                    {/* Providers Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 hover:border-slate-700 transition-all group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                                <span className="text-lg">👥</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-white">Providers</h2>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">
                            Review and approve provider registrations
                        </p>
                        <a
                            href="/admin/providers"
                            className="inline-block px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-xs sm:text-sm transition-colors"
                        >
                            Approve Providers →
                        </a>
                    </div>

                    {/* Audit Logs Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 hover:border-slate-700 transition-all group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                                <span className="text-lg">📋</span>
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-white">Audit Logs</h2>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">
                            Monitor all system activity and changes
                        </p>
                        <a
                            href="/admin/audit"
                            className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors"
                        >
                            View Logs →
                        </a>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                        <p className="text-slate-400 text-xs sm:text-sm mb-2">API Endpoints</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-400">31</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                        <p className="text-slate-400 text-xs sm:text-sm mb-2">User Roles</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-400">3</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                        <p className="text-slate-400 text-xs sm:text-sm mb-2">Routes</p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400">29</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                        <p className="text-slate-400 text-xs sm:text-sm mb-2">Status</p>
                        <p className="text-lg sm:text-xl font-bold text-white">Active ✓</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
