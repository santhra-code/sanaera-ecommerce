"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { productSchema, slugify, type ProductInput } from "@/lib/validations/product";
import { createProductAction, updateProductAction } from "@/app/admin/products/actions";
import CloudinaryUploader, { type UploadedImage } from "@/components/CloudinaryUploader";
import Button from "@/components/Button";

type Option = { id: string; name: string };

const EMPTY_VARIANT = { size: "", color: "", sku: "", price: null, availableStock: 0, lowStockThreshold: 5 };

export default function ProductForm({
  categories,
  collections,
  initial,
  productId,
}: {
  categories: Option[];
  collections: Option[];
  initial?: Partial<ProductInput>;
  productId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    discountPrice: initial?.discountPrice ?? null,
    sku: initial?.sku ?? "",
    barcode: initial?.barcode ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    collectionId: initial?.collectionId ?? "",
    status: initial?.status ?? "PUBLISHED",
    isFeatured: initial?.isFeatured ?? false,
    isNewArrival: initial?.isNewArrival ?? false,
    isTrending: initial?.isTrending ?? false,
    isBestSeller: initial?.isBestSeller ?? false,
    isLimitedEdition: initial?.isLimitedEdition ?? false,
    fabric: initial?.fabric ?? "",
    occasion: initial?.occasion ?? "",
    craftRegion: initial?.craftRegion ?? "",
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    images: initial?.images ?? [],
    variants: initial?.variants?.length ? initial.variants : [{ ...EMPTY_VARIANT }],
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTitleChange(value: string) {
    set("title", value);
    if (!slugTouched) set("slug", slugify(value));
  }

  function updateVariant(index: number, patch: Partial<ProductInput["variants"][number]>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }

  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, { ...EMPTY_VARIANT }] }));
  }

  function removeVariant(index: number) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }));
  }

  function handleUploaded(images: UploadedImage[]) {
    setForm((f) => ({
      ...f,
      images: [...f.images, ...images.map((img) => ({ url: img.url, publicId: img.publicId, alt: "" }))],
    }));
  }

  function removeImage(publicId: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i.publicId !== publicId) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = productSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const result = productId
      ? await updateProductAction(productId, parsed.data)
      : await createProductAction(parsed.data);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[880px]">
      {error && (
        <div className="bg-maroon/20 border border-maroon text-maroon text-[13px] p-4 mb-6">
          {error}
        </div>
      )}

      <Section title="Basic Info">
        <Field label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </Field>
        <Field label="Slug">
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputClass} h-28`}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-5">
          <Field label="SKU">
            <input className={inputClass} value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
          </Field>
          <Field label="Barcode (optional)">
            <input className={inputClass} value={form.barcode ?? ""} onChange={(e) => set("barcode", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Category">
            <select className={inputClass} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-emerald-deep">{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Collection (optional)">
            <select className={inputClass} value={form.collectionId ?? ""} onChange={(e) => set("collectionId", e.target.value)}>
              <option value="" className="bg-emerald-deep">— None —</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id} className="bg-emerald-deep">{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <Field label="Fabric"><input className={inputClass} value={form.fabric ?? ""} onChange={(e) => set("fabric", e.target.value)} /></Field>
          <Field label="Occasion"><input className={inputClass} value={form.occasion ?? ""} onChange={(e) => set("occasion", e.target.value)} /></Field>
          <Field label="Craft Region"><input className={inputClass} value={form.craftRegion ?? ""} onChange={(e) => set("craftRegion", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Price (₹)">
            <input type="number" min={0} step="0.01" className={inputClass} value={form.price} onChange={(e) => set("price", Number(e.target.value))} required />
          </Field>
          <Field label="Compare-at / Discount Price (optional)">
            <input
              type="number" min={0} step="0.01" className={inputClass}
              value={form.discountPrice ?? ""}
              onChange={(e) => set("discountPrice", e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Status & Merchandising Flags">
        <Field label="Status">
          <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as "DRAFT" | "PUBLISHED")}>
            <option value="DRAFT" className="bg-emerald-deep">Draft</option>
            <option value="PUBLISHED" className="bg-emerald-deep">Published</option>
          </select>
          <p className="text-[11px] text-text-secondary mt-1">Products are only visible on the storefront when status is Published.</p>
        </Field>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {(
            [
              ["isFeatured", "Featured"],
              ["isNewArrival", "New Arrival"],
              ["isTrending", "Trending"],
              ["isBestSeller", "Best Seller"],
              ["isLimitedEdition", "Limited Edition"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-[13px] text-warmwhite cursor-pointer">
              <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="accent-champagne" />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Images">
        <CloudinaryUploader folder="products" multiple onUploaded={handleUploaded} />
        {form.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
            {form.images.map((img) => (
              <div key={img.publicId} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || ""} className="aspect-[3/4] object-cover w-full" />
                <button
                  type="button"
                  onClick={() => removeImage(img.publicId)}
                  className="absolute top-1 right-1 bg-matte-black/80 text-warmwhite text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Variants & Inventory">
        <div className="flex flex-col gap-3">
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-end bg-emerald p-3">
              <Field label="Size" small>
                <input className={inputClassSm} value={v.size ?? ""} onChange={(e) => updateVariant(i, { size: e.target.value })} />
              </Field>
              <Field label="Color" small>
                <input className={inputClassSm} value={v.color ?? ""} onChange={(e) => updateVariant(i, { color: e.target.value })} />
              </Field>
              <Field label="Variant SKU" small>
                <input className={inputClassSm} value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} required />
              </Field>
              <Field label="Price override" small>
                <input
                  type="number" min={0} step="0.01" className={inputClassSm}
                  value={v.price ?? ""}
                  onChange={(e) => updateVariant(i, { price: e.target.value ? Number(e.target.value) : null })}
                />
              </Field>
              <Field label="Stock" small>
                <input type="number" min={0} className={inputClassSm} value={v.availableStock} onChange={(e) => updateVariant(i, { availableStock: Number(e.target.value) })} />
              </Field>
              <div className="flex items-end h-full pb-1.5">
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  disabled={form.variants.length === 1}
                  className="text-[11px] uppercase text-maroon hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-3 text-[12px] uppercase tracking-wide text-champagne hover:underline"
        >
          + Add Variant
        </button>
      </Section>

      <Section title="SEO">
        <Field label="SEO Title"><input className={inputClass} value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} /></Field>
        <Field label="SEO Description"><textarea className={`${inputClass} h-20`} value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} /></Field>
      </Section>

      <div className="flex gap-4 mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : productId ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full bg-transparent border-b border-line py-2.5 text-[14px] text-warmwhite focus:outline-none focus:border-champagne";
const inputClassSm =
  "w-full bg-transparent border-b border-line py-1.5 text-[12.5px] text-warmwhite focus:outline-none focus:border-champagne";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-display text-xl text-warmwhite mb-4">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function Field({ label, small, children }: { label: string; small?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={`block text-text-secondary uppercase tracking-[0.1em] mb-1.5 ${small ? "text-[10px]" : "text-[11px]"}`}>
        {label}
      </span>
      {children}
    </label>
  );
}
