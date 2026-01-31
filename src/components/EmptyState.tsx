import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-slate-400">{icon}</div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
}
