"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Editor from "./Editor";
import { createProduct } from "./actions";

export default function CreateProductPage() {
    const router = useRouter();
    const [previews, setPreviews] = useState<string[]>([]);
    const [techStack, setTechStack] = useState<string[]>([""]);
    const [features, setFeatures] = useState<string[]>([""]);
    const [description, setDescription] = useState("");
    const [displayPrice, setDisplayPrice] = useState("");
    const [rawPrice, setRawPrice] = useState("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...urls]);
        }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        setRawPrice(value);
        const formatted = new Intl.NumberFormat("id-ID").format(Number(value));
        setDisplayPrice(value ? formatted : "");
    };

    return (
        <div className="max-w-4xl mx-auto my-12 p-10 border rounded-3xl" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)', boxShadow: 'var(--card-shadow)' }} suppressHydrationWarning>
            <header className="mb-10 border-b pb-6" style={{ borderColor: 'var(--border-muted)' }}>
                <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Tambah Produk Baru</h1>
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Lengkapi detail produk digital Anda di bawah ini.</p>
            </header>

            {error && (
                <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--error)20', borderColor: 'var(--error)' }}>
                    <p className="font-medium" style={{ color: 'var(--error)' }}>❌ {error}</p>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--success)20', borderColor: 'var(--success)' }}>
                    <p className="font-medium" style={{ color: 'var(--success)' }}>✅ Produk berhasil dipublikasikan! Mengalihkan...</p>
                </div>
            )}

            <form action={createProduct} className="space-y-8">
                {/* Judul Produk */}
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Judul Produk *</label>
                    <input
                        name="title"
                        required
                        disabled={isPending}
                        className="w-full h-12 px-4 border-2 rounded-xl font-medium outline-none transition-all disabled:opacity-50"
                        style={{
                            borderColor: 'var(--border-secondary)',
                            color: 'var(--text-primary)',
                            backgroundColor: 'var(--card-background)'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary)20';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Contoh: Premium Dashboard UI Kit"
                        suppressHydrationWarning
                    />
                </div>

                {/* Kategori & Harga */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Kategori</label>
                        <input
                            name="category"
                            disabled={isPending}
                            className="w-full h-12 px-4 border-2 rounded-xl font-medium outline-none transition-all disabled:opacity-50"
                            style={{
                                borderColor: 'var(--border-secondary)',
                                color: 'var(--text-primary)',
                                backgroundColor: 'var(--card-background)'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            }}
                            placeholder="e.g. Website Template, UI Kit"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                            Harga (Price)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                                Rp
                            </span>
                            <input
                                type="text"
                                value={displayPrice}
                                onChange={handlePriceChange}
                                disabled={isPending}
                                className="w-full h-12 pl-12 pr-4 border-2 rounded-xl font-medium outline-none transition-all disabled:opacity-50"
                                style={{
                                    borderColor: 'var(--border-secondary)',
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'var(--card-background)'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                }}
                                placeholder="0"
                                suppressHydrationWarning
                            />
                            <input type="hidden" name="price" value={rawPrice} suppressHydrationWarning />
                        </div>
                    </div>
                </div>

                {/* Foto Produk */}
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Gambar Produk</label>
                    <div className="flex flex-wrap gap-4">
                        {previews.map((url, i) => (
                            <div key={i} className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 shadow-md" style={{ borderColor: 'var(--border-muted)' }}>
                                <Image src={url} alt="preview" fill unoptimized className="object-cover" />
                            </div>
                        ))}
                        <label className={`w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                            style={{
                                borderColor: 'var(--border-secondary)',
                                backgroundColor: 'var(--card-background)'
                            }}
                            onMouseEnter={(e) => !isPending && (e.currentTarget.style.borderColor = 'var(--primary)')}
                            onMouseLeave={(e) => !isPending && (e.currentTarget.style.borderColor = 'var(--border-secondary)')}
                            onMouseOver={(e) => !isPending && (e.currentTarget.style.backgroundColor = 'var(--primary)10')}
                            onMouseOut={(e) => !isPending && (e.currentTarget.style.backgroundColor = 'var(--card-background)')}
                        >
                            <span className="text-3xl group-hover:opacity-80 transition-opacity" style={{ color: 'var(--icon-muted)' }}>+</span>
                            <input
                                type="file"
                                name="images"
                                multiple
                                accept="image/*"
                                disabled={isPending}
                                className="hidden"
                                onChange={handleImageChange}
                                suppressHydrationWarning
                            />
                        </label>
                    </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Deskripsi Lengkap</label>
                    <Editor value={description} onChange={setDescription} />
                    <input type="hidden" name="description" value={description} suppressHydrationWarning />
                </div>

                {/* Tech Stack & Fitur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Tech Stack */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold uppercase" style={{ color: 'var(--text-primary)' }}>Tech Stack</label>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setTechStack([...techStack, ""])}
                                className="text-xs px-3 py-1 rounded-full transition disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--text-primary)',
                                    color: 'var(--text-inverse)'
                                }}
                                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--text-primary)')}
                            >+ Tambah</button>
                        </div>
                        {techStack.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={item}
                                    disabled={isPending}
                                    onChange={(e) => {
                                        const newS = [...techStack];
                                        newS[idx] = e.target.value;
                                        setTechStack(newS);
                                    }}
                                    className="flex-1 h-10 px-3 border-2 rounded-lg outline-none disabled:opacity-50"
                                    style={{
                                        borderColor: 'var(--border-secondary)',
                                        color: 'var(--text-primary)',
                                        backgroundColor: 'var(--card-background)'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                    }}
                                    placeholder="e.g. Next.js"
                                    suppressHydrationWarning
                                />
                                <input type="hidden" name="tech_stack_array" value={item} suppressHydrationWarning />
                            </div>
                        ))}
                    </section>

                    {/* Features */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold uppercase" style={{ color: 'var(--text-primary)' }}>Fitur Utama</label>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setFeatures([...features, ""])}
                                className="text-xs px-3 py-1 rounded-full transition disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--text-primary)',
                                    color: 'var(--text-inverse)'
                                }}
                                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--text-primary)')}
                            >+ Tambah</button>
                        </div>
                        {features.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={item}
                                    disabled={isPending}
                                    onChange={(e) => {
                                        const newF = [...features];
                                        newF[idx] = e.target.value;
                                        setFeatures(newF);
                                    }}
                                    className="flex-1 h-10 px-3 border-2 rounded-lg outline-none disabled:opacity-50"
                                    style={{
                                        borderColor: 'var(--border-secondary)',
                                        color: 'var(--text-primary)',
                                        backgroundColor: 'var(--card-background)'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                    }}
                                    placeholder="e.g. Dark Mode"
                                    suppressHydrationWarning
                                />
                                <input type="hidden" name="features_array" value={item} suppressHydrationWarning />
                            </div>
                        ))}
                    </section>
                </div>

                {/* Demo URL & Link Program */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Demo URL</label>
                        <input
                            name="demo_url"
                            type="url"
                            disabled={isPending}
                            className="w-full h-12 px-4 border-2 rounded-xl font-medium outline-none transition-all disabled:opacity-50"
                            style={{
                                borderColor: 'var(--border-secondary)',
                                color: 'var(--text-primary)',
                                backgroundColor: 'var(--card-background)'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            }}
                            placeholder="https://demo.example.com"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                            Link Program
                        </label>
                        <input
                            name="link_program"
                            type="url"
                            disabled={isPending}
                            className="w-full h-12 px-4 border-2 rounded-xl font-medium outline-none transition-all disabled:opacity-50"
                            style={{
                                borderColor: 'var(--border-secondary)',
                                color: 'var(--text-primary)',
                                backgroundColor: 'var(--card-background)'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            }}
                            placeholder="https://drive.google.com/..."
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending || success}
                    className="w-full font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--text-inverse)'
                    }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--primary)')}
                >
                    {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            MENYIMPAN...
                        </span>
                    ) : success ? "✅ BERHASIL!" : "PUBLISH SEKARANG"}
                </button>
            </form>
        </div>
    );
}