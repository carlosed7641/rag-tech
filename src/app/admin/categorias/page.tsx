import { getCategories } from "@/lib/products";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-[-0.03em] text-ink">Categorías</h1>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left eyebrow text-muted">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteCategoryButton categoryId={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Todavía no hay categorías.
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Nueva categoría
          </h2>
          <CategoryForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
