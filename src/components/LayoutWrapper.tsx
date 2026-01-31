import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen dark:bg-slate-950 bg-white flex flex-col">
            <Suspense fallback={<div className="h-16 dark:bg-slate-900 bg-white border-b dark:border-slate-800 border-slate-200" />}>
                <Navbar />
            </Suspense>
            <main className="flex-1 dark:bg-slate-950 bg-white">
                {children}
            </main>
        </div>
    );
}
