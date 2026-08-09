import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  await requirePermission("category:write");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
