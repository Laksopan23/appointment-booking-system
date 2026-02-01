"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background">
            <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">
                    Something went wrong
                </h2>
                <p className="text-sm text-muted-foreground">
                    An unexpected error occurred. Please try again.
                </p>
                {process.env.NODE_ENV === "development" && error.message && (
                    <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl font-mono border border-destructive/20">
                        {error.message}
                    </p>
                )}
                <Button onClick={reset} className="gap-2 mt-4">
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        </main>
    );
}
