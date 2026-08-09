import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Payment Methods — SANAÉRA" };

export default async function PaymentMethodsPage() {
  const session = await auth();
  const methods = await prisma.paymentMethod.findMany({
    where: { userId: session!.user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-2">Payment Methods</h1>
      <p className="text-sm text-text-secondary mb-8">
        Saved cards and UPI handles from your Razorpay checkouts appear here.
      </p>

      {methods.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No saved payment methods yet — one gets added automatically the first
          time you choose "save for next time" at checkout.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-px bg-line">
          {methods.map((m) => (
            <div key={m.id} className="bg-emerald-deep p-5">
              <div className="text-sm text-warmwhite">
                {m.brand ?? "Card"} {m.last4 ? `•••• ${m.last4}` : ""}
              </div>
              {m.isDefault && (
                <div className="text-[10.5px] uppercase tracking-wide text-champagne mt-1">
                  Default
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
