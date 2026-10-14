import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import * as productsRoute from "../app/api/products/route";
import { GET as lowStockCron } from "../app/api/cron/low-stock-check/route";
import { productSchema } from "../lib/validations/product";

test("public product endpoint does not expose product creation", () => {
  assert.equal("POST" in productsRoute, false);
});

test("product validation rejects a compare-at price below the selling price", () => {
  const product = {
    title: "Test product",
    slug: "test-product",
    description: "A sample product for schema validation.",
    price: 100,
    sku: "TEST-001",
    categoryId: "category-id",
    status: "PUBLISHED",
    images: [],
    variants: [{ sku: "TEST-001-M", availableStock: 1, lowStockThreshold: 0 }],
  };

  assert.equal(productSchema.safeParse({ ...product, discountPrice: 120 }).success, false);
  assert.equal(productSchema.safeParse({ ...product, discountPrice: 80 }).success, true);
});

test("low-stock cron refuses to run when its secret is missing", async () => {
  const previousSecret = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  try {
    const response = await lowStockCron(new NextRequest("https://example.test/api/cron/low-stock-check"));
    assert.equal(response.status, 503);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});

test("low-stock cron rejects an invalid bearer secret", async () => {
  const previousSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "test-only-secret";
  try {
    const request = new NextRequest("https://example.test/api/cron/low-stock-check", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    const response = await lowStockCron(request);
    assert.equal(response.status, 401);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});