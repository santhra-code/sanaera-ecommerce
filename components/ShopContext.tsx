"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: string;
  numericPrice: number;
  size: string;
  color: string;
  colorName: string;
  image: string;
  quantity: number;
};

export type WishlistItem = {
  slug: string;
  name: string;
  price: string;
  numericPrice: number;
  category: string;
  image: string;
};

export type Toast = {
  id: number;
  title: string;
  message: string;
  type: "cart" | "wishlist";
  image?: string;
  href?: string;
  actionText?: string;
};

type ShopContextType = {
  cart: CartItem[];
  wishlist: WishlistItem[];
  toast: Toast | null;
  addToCart: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (slug: string) => boolean;
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
  hideToast: () => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const CART_STORAGE_KEY = "sanaera_cart_v1";
const WISHLIST_STORAGE_KEY = "sanaera_wishlist_v1";

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error("Failed to load shop state from localStorage:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage:", e);
    }
  }, [wishlist, isInitialized]);

  const showToast = (toastData: Omit<Toast, "id">) => {
    setToast({
      ...toastData,
      id: Date.now(),
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  const addToCart = (
    itemData: Omit<CartItem, "id" | "quantity">,
    quantityToAdd: number = 1
  ) => {
    const id = `${itemData.slug}-${itemData.size}-${itemData.color}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityToAdd,
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...itemData,
          id,
          quantity: quantityToAdd,
        },
      ];
    });

    showToast({
      title: "Added to Bag",
      message: `${itemData.name} (${itemData.size} · ${itemData.colorName})`,
      type: "cart",
      image: itemData.image,
      href: "/account/cart",
      actionText: "View Bag →",
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.some((w) => w.slug === item.slug);

    if (exists) {
      setWishlist((prev) => prev.filter((w) => w.slug !== item.slug));
      showToast({
        title: "Removed from Wishlist",
        message: item.name,
        type: "wishlist",
        image: item.image,
        href: "/account/wishlist",
        actionText: "View Wishlist →",
      });
    } else {
      setWishlist((prev) => [item, ...prev]);
      showToast({
        title: "Saved to Wishlist",
        message: item.name,
        type: "wishlist",
        image: item.image,
        href: "/account/wishlist",
        actionText: "View Wishlist →",
      });
    }
  };

  const isInWishlist = (slug: string) => {
    return wishlist.some((item) => item.slug === slug);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.numericPrice * item.quantity,
    0
  );

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        toast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartCount,
        wishlistCount,
        cartSubtotal,
        hideToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
