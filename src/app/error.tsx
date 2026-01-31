"use client";

import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-md">
                <h2 className="text-2xl font-semibold text-white">
                    Something went wrong
                </h2>
                <p className="text-sm text-slate-400">
                    An unexpected error occurred. Please try again.
                </p>
                {process.env.NODE_ENV === "development" && error.message && (
                    <p className="text-xs text-red-400 bg-red-950/20 p-3 rounded font-mono">
                        {error.message}
                    </p>
                )}
                <Button onClick={reset}>Retry</Button>
            </div>
        </main>
    );
}
