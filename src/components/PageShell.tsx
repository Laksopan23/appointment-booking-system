import React from "react";

interface PageShellProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
    return (
        <main className="min-h-[calc(100vh-64px)] bg-background text-foreground relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-background dark:from-[#070B14] dark:to-[#05070D]" />
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {children}
            </div>
        </main>
    );
}
