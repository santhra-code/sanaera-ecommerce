import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import CollectionManager from "@/components/admin/CollectionManager";

export const metadata = { title: "Collections — Admin" };

export default async function AdminCollectionsPage() {
  await requirePermission("collection:write");

  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Collections</h1>
      <CollectionManager collections={collections} />
    </div>
  );
}
