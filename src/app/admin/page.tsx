import Link from "next/link";
import { Settings, Users, Shield, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
    return (
        <main className="min-h-screen bg-background">
            <div className="page-container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-description">Manage services, providers, and monitor system activity</p>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {/* Services Card */}
                    <Card className="aurora-card-hover group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Settings className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-semibold text-foreground">Services</h2>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4">
                                Create, update, and manage appointment services
                            </p>
                            <Button asChild size="sm">
                                <Link href="/admin/services">Manage Services →</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Providers Card */}
                    <Card className="aurora-card-hover group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                    <Users className="w-5 h-5 text-accent" />
                                </div>
                                <h2 className="text-lg font-semibold text-foreground">Providers</h2>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4">
                                Review and approve provider registrations
                            </p>
                            <Button asChild variant="secondary" size="sm">
                                <Link href="/admin/providers">Approve Providers →</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Audit Logs Card */}
                    <Card className="aurora-card-hover group">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-success/15 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors">
                                    <Shield className="w-5 h-5 text-success" />
                                </div>
                                <h2 className="text-lg font-semibold text-foreground">Audit Logs</h2>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4">
                                Monitor all system activity and changes
                            </p>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin/audit">View Logs →</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="aurora-card">
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-muted-foreground text-xs sm:text-sm mb-2">API Endpoints</p>
                            <p className="text-2xl sm:text-3xl font-bold text-primary">31</p>
                        </CardContent>
                    </Card>
                    <Card className="aurora-card">
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-muted-foreground text-xs sm:text-sm mb-2">User Roles</p>
                            <p className="text-2xl sm:text-3xl font-bold text-accent">3</p>
                        </CardContent>
                    </Card>
                    <Card className="aurora-card">
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-muted-foreground text-xs sm:text-sm mb-2">Routes</p>
                            <p className="text-2xl sm:text-3xl font-bold text-success">29</p>
                        </CardContent>
                    </Card>
                    <Card className="aurora-card">
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-muted-foreground text-xs sm:text-sm mb-2">Status</p>
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-success" />
                                <p className="text-lg sm:text-xl font-bold text-foreground">Active</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
