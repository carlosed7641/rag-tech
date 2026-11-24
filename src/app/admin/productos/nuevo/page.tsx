import { getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { BackLink } from "@/components/ui/BackLink";
import { createProduct } from "@/app/admin/productos/actions";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <BackLink href="/admin/productos">Volver a productos</BackLink>
      <h1 className="mb-8 text-3xl font-bold tracking-[-0.03em] text-ink">Nuevo producto</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
