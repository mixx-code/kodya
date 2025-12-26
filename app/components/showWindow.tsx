"use client";
// ShowWindow Component - Container untuk memamerkan produk
interface ShowWindowProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function ShowWindow({ children, title, description }: ShowWindowProps) {
    return (
        <section className="w-full py-6 md:py-8">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
                {(title || description) && (
                    <div className="mb-6">
                        {title && (
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-sm md:text-base text-gray-600 mt-1">
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