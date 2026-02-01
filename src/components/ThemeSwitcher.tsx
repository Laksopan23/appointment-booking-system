'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

function ThemeSwitcherContent() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const themes = [
        { value: 'light' as const, label: 'Light', icon: Sun },
        { value: 'dark' as const, label: 'Dark', icon: Moon },
        { value: 'system' as const, label: 'System', icon: Monitor },
    ];

    const handleThemeChange = useCallback((value: 'light' | 'dark' | 'system') => {
        setTheme(value);
        setIsOpen(false);
    }, [setTheme]);

    if (!mounted) {
        return <div className="w-10 h-10" />;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Toggle theme"
                aria-label="Toggle theme"
            >
                {theme === 'light' && <Sun className="w-5 h-5" />}
                {theme === 'dark' && <Moon className="w-5 h-5" />}
                {theme === 'system' && <Monitor className="w-5 h-5" />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-card border border-border z-50">
                    <div className="p-2 space-y-1">
                        {themes.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => handleThemeChange(value)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === value
                                    ? 'bg-primary/15 text-primary'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{label}</span>
                                {theme === value && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ThemeSwitcher() {
    return <ThemeSwitcherContent />;
}
