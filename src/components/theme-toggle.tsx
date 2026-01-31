`use client`;

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Icon className="h-4 w-4" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-md bg-popover text-popover-foreground border border-border z-50">
                    <div className="p-1 space-y-1">
                        <button
                            onClick={() => {
                                setTheme("light");
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${theme === "light"
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <Sun className="h-4 w-4" />
                            Light
                        </button>
                        <button
                            onClick={() => {
                                setTheme("dark");
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${theme === "dark"
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <Moon className="h-4 w-4" />
                            Dark
                        </button>
                        <button
                            onClick={() => {
                                setTheme("system");
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${theme === "system"
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <Monitor className="h-4 w-4" />
                            System
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
