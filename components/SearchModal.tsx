"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useModalFocus } from "@/components/useModalFocus";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

const EMPTY_PRODUCTS: Product[] = [];

const QUICK_TAGS = [
  "Sarees",
  "Lehengas",
  "Banarasi",
  "Kanjivaram",
  "Jewelry",
  "Chikankari",
  "Bridal",
];

export default function SearchModal({ isOpen, onClose, products = EMPTY_PRODUCTS }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [catalogProducts, setCatalogProducts] = useState(products);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalFocus(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    let cancelled = false;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    fetch("/api/products", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Product search is unavailable");
        return response.json();
      })
      .then((data: { products?: Product[] }) => {
        if (!cancelled && Array.isArray(data.products)) setCatalogProducts(data.products);
      })
      .catch(() => {
        if (!cancelled) setCatalogProducts(products);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, products]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalogProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [query, catalogProducts]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal((
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Search catalog"
      className="fixed inset-0 z-[1000] flex flex-col bg-matte-black/95 backdrop-blur-xl animate-in fade-in duration-200"
    >
      {/* Search Header Bar */}
      <div className="border-b border-line px-6 py-6 md:px-12 flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
        <div className="relative flex-1 flex items-center">
          <span className="text-[#DEB092] text-lg mr-3 select-none" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sarees, lehengas, fabrics, crafts..."
            className="w-full bg-transparent font-display text-xl md:text-2xl text-warmwhite placeholder:text-text-secondary/60 focus:outline-none"
            aria-label="Search catalog"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs uppercase tracking-wider text-text-secondary hover:text-champagne px-2 py-1"
              aria-label="Clear search query"
            >
              Clear
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs uppercase tracking-wide text-[#DEB092] hover:text-warmwhite py-2 px-3 border border-[#DEB092]/30 hover:border-[#DEB092] transition-colors focus-visible:ring-2 focus-visible:ring-champagne"
          aria-label="Close search"
        >
          ← Back
        </button>
      </div>

      {/* Body Area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-5xl mx-auto w-full"
      >
        {/* Quick Filter Chips */}
        <div className="mb-8">
          <span className="text-[11px] font-label uppercase tracking-[0.16em] text-antique-gold block mb-3">
            Popular Curations
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="text-xs px-3.5 py-1.5 border border-line hover:border-champagne text-sand hover:text-warmwhite transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-champagne"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Announcement */}
        <div role="status" aria-live="polite" className="sr-only">
          {query
            ? `${filteredProducts.length} results found for ${query}`
            : "Type to search catalog"}
        </div>

        {/* Results */}
        {query && filteredProducts.length > 0 ? (
          <div>
            <div className="text-xs font-label uppercase tracking-[0.16em] text-text-secondary mb-4">
              Results ({filteredProducts.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const img = p.images[0]?.url;
                return (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    onClick={onClose}
                    className="group bg-emerald-deep/60 border border-line hover:border-champagne p-3.5 flex gap-4 items-center transition-all focus-visible:ring-2 focus-visible:ring-champagne"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        className="w-16 h-20 object-cover border border-line flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-wine-deep border border-line flex items-center justify-center text-xs text-sand flex-shrink-0">
                        {p.tag}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[10.5px] uppercase tracking-[0.12em] text-antique-gold mb-1">
                        {p.category}
                      </div>
                      <h4 className="font-display text-base text-warmwhite group-hover:text-champagne transition-colors truncate">
                        {p.name}
                      </h4>
                      <div className="text-xs text-sand/80 mt-1 font-medium">{p.price}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-sand mb-2">No silhouettes found</p>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              We couldn&apos;t find an exact match for &quot;{query}&quot;. Try exploring our bridal edits or state collections.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  ), document.body);
}
