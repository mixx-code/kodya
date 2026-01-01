import CategorySection from "./components/categorySection";
import HeroSection from "./components/heroSection";
import { ShowWindow } from "./components/showWindow";
import { fetchProductsCursor } from "./actions";
import ProductListClient from "./components/ProductListClient";
import { getUniqueCategories } from "./(customer)/product/actions/categories";

export default async function Home() {
  // Ambil data awal (6 produk pertama)
  const { data: initialProducts, nextCursor } = await fetchProductsCursor(undefined, 6);
  console.log('Data Products:', initialProducts);
  const categories = await getUniqueCategories();
  return (
    <>
      <HeroSection />
      <CategorySection initialCategories={categories} />
      <ShowWindow
        title="Produk Kami"
        description="Temukan berbagai produk digital berkualitas untuk kebutuhan project Anda"
      >
        {/* Render List Produk di sisi Client agar bisa Load More */}
        <ProductListClient
          initialProducts={initialProducts}
          initialCursor={nextCursor}
        />
      </ShowWindow>
    </>
  );
}