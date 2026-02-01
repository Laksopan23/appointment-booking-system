"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => setMounted(true), []);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon-sm" disabled className="opacity-50">
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    const Icon = resolvedTheme === "dark" ? Moon : Sun;

    const themes = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
            >
                <Icon className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl shadow-lg bg-popover text-popover-foreground border border-border z-50 overflow-hidden animate-slideDown">
                    <div className="p-1">
                        {themes.map(({ value, label, icon: ItemIcon }) => (
                            <button
                                key={value}
                                onClick={() => {
                                    setTheme(value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${theme === value
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <ItemIcon className="h-4 w-4" />
                                    {label}
                                </span>
                                {theme === value && <Check className="h-3.5 w-3.5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
