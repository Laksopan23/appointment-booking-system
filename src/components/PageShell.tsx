import React from "react";

interface PageShellProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export function PageShell({ title, description, children, actions }: PageShellProps) {
    return (
        <main className="min-h-[calc(100vh-64px)] bg-background">
            <div className="page-container">
                {/* Page Header */}
                <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="page-title">{title}</h1>
                        {description && (
                            <p className="page-description">{description}</p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Page Content */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </main>
    );
}
