import { z } from "zod";

export const addressSchema = z.object({
  type: z.enum(["BILLING", "SHIPPING"]),
  isDefault: z.boolean().optional().default(false),
  fullName: z.string().min(1, "Full name is required").max(120),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number"),
  line1: z.string().min(1, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(3, "Postal code is required").max(12),
  country: z.string().min(1).max(60).default("India"),
});

export const cartAddSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(0).max(20),
});

export const wishlistAddSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CartAddInput = z.infer<typeof cartAddSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
