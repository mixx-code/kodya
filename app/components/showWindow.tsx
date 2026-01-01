"use client";
// ShowWindow Component - Container untuk memamerkan produk
import { useDarkMode } from "../contexts/DarkModeContext";

interface ShowWindowProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function ShowWindow({ children, title, description }: ShowWindowProps) {
    const { isDarkMode } = useDarkMode();

    return (
        <section className="w-full py-6 md:py-8">
            <div className="rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', color: 'var(--card-foreground)', borderColor: 'var(--card-border)' }}>
                {(title || description) && (
                    <div className="mb-6">
                        {title && (
                            <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-sm md:text-base mt-1" style={{ color: 'var(--text-secondary)' }}>
                                {description}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}