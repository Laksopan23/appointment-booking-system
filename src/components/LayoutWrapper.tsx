import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Suspense fallback={<div className="h-16 bg-card border-b border-border" />}>
                <Navbar />
            </Suspense>
            <main className="flex-1 bg-background">
                {children}
            </main>
        </div>
    );
}
