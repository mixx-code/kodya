"use client";

import { useState } from "react";
import Image from "next/image";
import Editor from "./Editor";
import { createProduct } from "./actions";

export default function CreateProductPage() {
    const [previews, setPreviews] = useState<string[]>([]);
    const [techStack, setTechStack] = useState<string[]>([""]);
    const [features, setFeatures] = useState<string[]>([""]);
    const [description, setDescription] = useState("");
    const [displayPrice, setDisplayPrice] = useState(""); // Untuk tampilan (ber-titik)
    const [rawPrice, setRawPrice] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...urls]);
        }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Hapus semua karakter non-angka
        setRawPrice(value);

        // Format ke Rupiah (tambahkan titik setiap 3 digit)
        const formatted = new Intl.NumberFormat("id-ID").format(Number(value));
        setDisplayPrice(value ? formatted : "");
    };

    return (
        <div className="max-w-4xl mx-auto my-12 p-10 bg-white border border-slate-200 shadow-2xl rounded-3xl">
            <header className="mb-10 border-b border-slate-100 pb-6">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tambah Produk Baru</h1>
                <p className="text-slate-500 mt-2">Lengkapi detail produk digital Anda di bawah ini.</p>
            </header>

            <form action={createProduct} className="space-y-8">
                {/* Judul Produk */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Judul Produk *</label>
                    <input
                        name="title"
                        required
                        className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        placeholder="Contoh: Premium Dashboard UI Kit"
                    />
                </div>

                {/* INPUT BARU: Kategori & Harga */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Kategori</label>
                        <input
                            name="category"
                            className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. Website Template, UI Kit"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Harga (Price)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                Rp
                            </span>
                            <input
                                type="text"
                                value={displayPrice}
                                onChange={handlePriceChange}
                                className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-blue-500 outline-none transition-all"
                                placeholder="0"
                            />
                            {/* Hidden input agar yang terkirim ke Server Action adalah angka murni */}
                            <input type="hidden" name="price" value={rawPrice} />
                        </div>
                    </div>
                </div>

                {/* Foto Produk */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Gambar Produk</label>
                    <div className="flex flex-wrap gap-4">
                        {previews.map((url, i) => (
                            <div key={i} className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md">
                                <Image src={url} alt="preview" fill unoptimized className="object-cover" />
                            </div>
                        ))}
                        <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                            <span className="text-3xl text-slate-400 group-hover:text-blue-500">+</span>
                            <input type="file" name="images" multiple className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                {/* Deskripsi (TipTap) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Deskripsi Lengkap</label>
                    <Editor value={description} onChange={setDescription} />
                    <input type="hidden" name="description" value={description} />
                </div>

                {/* Tech Stack & Fitur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Tech Stack */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-900 uppercase">Tech Stack</label>
                            <button
                                type="button"
                                onClick={() => setTechStack([...techStack, ""])}
                                className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-600 transition"
                            >+ Tambah</button>
                        </div>
                        {techStack.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={item}
                                    onChange={(e) => {
                                        const newS = [...techStack]; newS[idx] = e.target.value; setTechStack(newS);
                                    }}
                                    className="flex-1 h-10 px-3 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Next.js"
                                />
                                <input type="hidden" name="tech_stack_array" value={item} />
                            </div>
                        ))}
                    </section>

                    {/* Features */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-900 uppercase">Fitur Utama</label>
                            <button
                                type="button"
                                onClick={() => setFeatures([...features, ""])}
                                className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-600 transition"
                            >+ Tambah</button>
                        </div>
                        {features.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={item}
                                    onChange={(e) => {
                                        const newF = [...features]; newF[idx] = e.target.value; setFeatures(newF);
                                    }}
                                    className="flex-1 h-10 px-3 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Dark Mode"
                                />
                                <input type="hidden" name="features_array" value={item} />
                            </div>
                        ))}
                    </section>
                </div>

                {/* Demo URL */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">Demo URL</label>
                    <input
                        name="demo_url"
                        type="url"
                        className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-blue-500 outline-none transition-all"
                        placeholder="https://example.com"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 hover:shadow-2xl transition-all transform active:scale-[0.98]"
                >
                    PUBLISH SEKARANG
                </button>
            </form>
        </div>
    );
}