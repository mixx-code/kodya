"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Edit, Trash2, Eye, Plus, Search, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface Product {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  price: string | null;
  demo_url: string | null;
  link_program: string | null;
  images: string[] | null;
  tech_stack: string[] | null;
  features: string[] | null;
  rating: number | null;
  reviews: number | null;
  sales: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function ProductsListPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 100);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch products with sales data from order_items
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return;
      }

      // Fetch order items to calculate sales per product
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity');

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        return;
      }

      // Calculate sales per product
      const salesMap = new Map<number, number>();
      orderItems?.forEach(item => {
        const currentSales = salesMap.get(item.product_id) || 0;
        salesMap.set(item.product_id, currentSales + item.quantity);
      });

      // Process products data with calculated sales
      const processedData = (products || []).map(product => ({
        ...product,
        tech_stack: product.tech_stack || [],
        features: product.features || [],
        reviews: product.reviews || 0,
        sales: salesMap.get(product.id) || 0 // Use calculated sales from order_items
      }));
      
      setProducts(processedData);
      
      // Extract unique categories from processed data
      const uniqueCategories = [...new Set(processedData.map(p => p.category).filter((cat): cat is string => cat !== null))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    setDeleteLoading(productId.toString());
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk');
        return;
      }

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Produk berhasil dihapus');
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menghapus produk');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Daftar Produk
            </h1>
            <Link
              href="/admin/products/create"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              <Plus className="w-4 h-4" />
              Tambah Produk
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--icon-muted)' }} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all"
                style={{
                  borderColor: 'var(--border-secondary)',
                  backgroundColor: 'var(--card-background)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                }}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--icon-muted)' }} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-lg outline-none transition-all appearance-none cursor-pointer"
                style={{
                  borderColor: 'var(--border-secondary)',
                  backgroundColor: 'var(--card-background)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                }}
              >
                <option value="">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {products.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Total Produk
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {categories.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Kategori
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {products.reduce((sum, p) => sum + (p.sales || 0), 0)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Total Penjualan
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--border-muted)' }}>
              <Search className="w-12 h-12" style={{ color: 'var(--icon-muted)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tidak ada produk ditemukan</h3>
            <p>Coba ubah kata kunci atau filter kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border overflow-hidden transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)'
                }}
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--border-muted)' }}>
                      <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--border-secondary)' }}>
                          <Plus className="w-8 h-8" style={{ color: 'var(--icon-muted)' }} />
                        </div>
                        <p>Tidak ada gambar</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}>
                      {product.category}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                      {formatPrice(product.price)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {product.sales !== null ? product.sales : 0} terjual
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {product.tech_stack && product.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tech_stack.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: 'var(--border-muted)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {product.tech_stack.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-full" style={{ color: 'var(--text-muted)' }}>
                          +{product.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-muted)' }}>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--border-muted)',
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--border-muted)'}
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </Link>
                    
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--border-muted)',
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--border-muted)'}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteLoading === product.id.toString()}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--error)20',
                        color: 'var(--error)',
                        borderColor: 'var(--error)'
                      }}
                      onMouseEnter={(e) => !deleteLoading && (e.currentTarget.style.backgroundColor = 'var(--error)30')}
                      onMouseLeave={(e) => !deleteLoading && (e.currentTarget.style.backgroundColor = 'var(--error)20)')}
                    >
                      {deleteLoading === product.id.toString() ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
