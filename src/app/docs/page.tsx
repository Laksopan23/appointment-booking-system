"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
    ssr: false,
    loading: () => <div className="p-4">Loading API Documentation...</div>,
});

export default function DocsPage() {
    useEffect(() => {
        // Suppress the swagger-ui-react UNSAFE_componentWillReceiveProps warning
        const originalError = console.error;
        console.error = function (...args: any[]) {
            if (
                typeof args[0] === "string" &&
                args[0].includes("UNSAFE_componentWillReceiveProps")
            ) {
                return;
            }
            originalError.call(console, ...args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    return (
        <main className="min-h-screen p-4">
            <h1 className="text-2xl font-semibold mb-4">API Documentation</h1>
            <SwaggerUI url="/api/docs" />
        </main>
    );
}
