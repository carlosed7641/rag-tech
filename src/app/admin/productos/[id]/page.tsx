import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { BackLink } from "@/components/ui/BackLink";
import { updateProduct } from "@/app/admin/productos/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, categories] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    getCategories(),
  ]);

  if (!product) notFound();

  const boundAction = updateProduct.bind(null, id);

  return (
    <div>
      <BackLink href="/admin/productos">Volver a productos</BackLink>
      <h1 className="mb-8 text-3xl font-bold tracking-[-0.03em] text-ink">Editar producto</h1>
      <ProductForm action={boundAction} categories={categories} product={product} />
    </div>
  );
}
