import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddressManager from "@/components/account/AddressManager";

export const metadata = { title: "Addresses — SANAÉRA" };

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Addresses</h1>
      <AddressManager addresses={addresses} />
    </div>
  );
}
