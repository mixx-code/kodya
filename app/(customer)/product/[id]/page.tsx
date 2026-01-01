// app/(customer)/product/[id]/page.tsx
import ProductDetail from "@/app/components/productDetail";
import { notFound } from "next/navigation";
import { getProductById } from "../actions/product";
import NotFound from "@/app/not-found";

export default async function ProductPage({ params }: { params: { id: string } }) {
    const { id } = await params; // Next.js 15 mewajibkan await params
    const productId = parseInt(id);

    // if (isNaN(productId)) notFound();

    const product = await getProductById(productId);

    if (!product) {
        // notFound(); // Ini akan langsung mengarahkan ke file not-found.tsx di atas
        return <NotFound />;
    }

    return (
        <ProductDetail
            id={product.id}
            title={product.title}
            description={product.description || ""}
            price={product.price || "0"}
            category={product.category || ""}
            rating={product.rating || 0}
            reviews={product.reviews || 0}
            sales={product.sales || 0}
            images={product.images || []}
            features={product.features || []}
            techStack={product.tech_stack || []}
            demoUrl={product.demo_url || ""}
        />
    );
}