"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductSchema, type Product } from "@/types/product";
import {
  AdminProductSchema,
  initializeProductVariants,
  normalizeProductImages,
} from "@/lib/admin-product";
import {
  DEFAULT_SHIPPING_RETURNS,
  HOMEPAGE_SECTIONS,
  hasProductTag,
  orderedProductImages,
  productHref,
  type ProductVariant,
} from "@/lib/product-presentation";
import { useProductCache } from "@/store/product-cache";
import { ProductImageEditor } from "./product-image-editor";

type Props = {
  product?: Partial<Product>;
  categories: { slug: string; name: string }[];
  isNew?: boolean;
};
const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900";
const tags = [
  ["isNew", "New"],
  ["isBestSeller", "Best Seller"],
  ["isTrending", "Most Trending"],
] as const;
const lines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function DetailsEditor({
  description,
  features,
  specs,
  shippingReturns,
  onChange,
}: {
  description: string;
  features: string[];
  specs: Record<string, string>;
  shippingReturns: string;
  onChange: (value: {
    description?: string;
    features?: string[];
    specs?: Record<string, string>;
    shippingReturns?: string;
  }) => void;
}) {
  const [detailError, setDetailError] = useState("");
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        Description
        <textarea
          className={`${inputClass} mt-1`}
          rows={4}
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </label>
      <label className="block text-sm font-medium">
        Key Features (one per line)
        <textarea
          className={`${inputClass} mt-1`}
          rows={5}
          value={features.join("\n")}
          onChange={(e) => onChange({ features: e.target.value.split("\n") })}
        />
      </label>
      <div className="space-y-2">
        <p className="text-sm font-medium">Product Details</p>
        {Object.entries(specs).map(([key, value], index) => (
          <div key={index} className="flex gap-2">
            <input
              aria-label={`Detail ${index + 1} name`}
              className={inputClass}
              value={key}
              onChange={(e) => {
                const entries = Object.entries(specs);
                if (e.target.value !== key && Object.hasOwn(specs, e.target.value)) {
                  setDetailError(
                    "Each product detail needs a different name. The existing details have been kept.",
                  );
                  return;
                }
                setDetailError("");
                entries[index] = [e.target.value, value];
                onChange({ specs: Object.fromEntries(entries) });
              }}
            />
            <input
              aria-label={`Detail ${index + 1} value`}
              className={inputClass}
              value={value}
              onChange={(e) => onChange({ specs: { ...specs, [key]: e.target.value } })}
            />
            <button
              type="button"
              className="text-sm text-red-700"
              onClick={() =>
                onChange({
                  specs: Object.fromEntries(Object.entries(specs).filter(([name]) => name !== key)),
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
        {detailError && (
          <p role="alert" className="text-sm text-red-700">
            {detailError}
          </p>
        )}
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm"
          onClick={() => {
            let key = "New detail";
            for (let n = 2; key in specs; n++) key = `New detail ${n}`;
            onChange({ specs: { ...specs, [key]: "" } });
          }}
        >
          Add detail
        </button>
      </div>
      <label className="block text-sm font-medium">
        Shipping &amp; Returns
        <textarea
          className={`${inputClass} mt-1`}
          rows={4}
          value={shippingReturns}
          onChange={(e) => onChange({ shippingReturns: e.target.value })}
        />
      </label>
    </div>
  );
}

export function EnhancedProductForm({ product, categories, isNew = false }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Product>(() =>
    initializeProductVariants(
      ProductSchema.parse({
        ...product,
        id: product?.id ?? crypto.randomUUID(),
        name: product?.name ?? "",
        slug: product?.slug || `group-${crypto.randomUUID()}`,
        description: product?.description ?? "",
        shippingReturns: product?.shippingReturns ?? DEFAULT_SHIPPING_RETURNS,
        price: product?.price || 1,
        image: product?.image ?? "",
        category:
          product?.category === "handbag" ? "shoulder-bag" : (product?.category ?? "tote-bag"),
        gender: product?.gender ?? "women",
        colorVariants: (product?.colorVariants?.length
          ? product.colorVariants
          : product?.image
            ? [
                {
                  variantId: `${product.id}-default`,
                  color: "Default",
                  slug: "default",
                  image: product.image,
                  gallery: product.gallery,
                  productTitle: product.name,
                },
              ]
            : []
        ).map((variant) => ({
          ...variant,
          variantId: variant.variantId || `${product?.id}-${variant.slug}`,
        })),
      }),
    ),
  );
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [created, setCreated] = useState(!isNew);
  const [expanded, setExpanded] = useState<number | null>(null);
  const savingRef = useRef(false);

  function update(value: Partial<Product>) {
    setForm((current) => ({ ...current, ...value }));
    setSaved(false);
  }
  function updateVariant(index: number, value: Partial<ProductVariant>) {
    setForm((current) => ({
      ...current,
      colorVariants: current.colorVariants.map((variant, i) =>
        i === index ? { ...variant, ...value } : variant,
      ),
    }));
    setSaved(false);
  }
  function setImages(images: string[], index: number) {
    const value = { image: images[0] ?? "", gallery: images, displayImage: undefined };
    updateVariant(index, value);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (savingRef.current || busy) return;
    setError("");
    setSaved(false);
    const payload = normalizeProductImages({
      ...form,
      features: lines(form.features.join("\n")),
      colorVariants: form.colorVariants.map((variant) => ({
        ...variant,
        variantId: variant.variantId || `${form.id}-${variant.slug}`,
        pageSlug: variant.pageSlug?.trim() || undefined,
        features: variant.features?.map((value) => value.trim()).filter(Boolean),
      })),
    });
    const result = AdminProductSchema.safeParse(payload);
    if (!result.success) {
      setError(
        result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"),
      );
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const response = await fetch(
        created ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: created ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.data),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Product could not be saved.");
      setCreated(true);
      setForm(result.data);
      setSaved(true);
      useProductCache.getState().invalidate();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Product could not be saved.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6 pb-10 text-gray-900">
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b bg-white p-4">
        <h1 className="text-2xl font-bold">{created ? "Edit Product" : "Create Product"}</h1>
        <div className="flex gap-3">
          <Link href="/admin/products" className="rounded border px-4 py-2 text-sm">
            Back to products
          </Link>
          <button
            type="submit"
            disabled={saving || busy}
            aria-busy={saving}
            className="rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="whitespace-pre-line rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded bg-green-50 p-4 text-sm text-green-800">
          Product saved. Website data has been refreshed.
        </p>
      )}
      <fieldset disabled={saving || busy} className="space-y-6 disabled:opacity-70">
        <section className="space-y-4 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Product Group</h2>
          <p className="text-sm text-gray-600">
            These shared fields link the colours together. Each colour below owns its product name,
            price, images and page content.
          </p>
          <label className="block text-sm font-medium">
            Group Name
            <input
              required
              className={`${inputClass} mt-1`}
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Category
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) =>
                  update({ category: ProductSchema.shape.category.parse(e.target.value) })
                }
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Gender
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) =>
                  update({ gender: ProductSchema.shape.gender.parse(e.target.value) })
                }
              >
                {["women", "men", "unisex"].map((gender) => (
                  <option key={gender}>{gender}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.inStock === false}
              onChange={(e) => update({ inStock: !e.target.checked })}
            />
            Sold out (all colours)
          </label>
          <div className="flex flex-wrap gap-5">
            {tags.map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[key] ?? false}
                  onChange={(e) => update({ [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Product tags are defaults. Each colour can inherit them or explicitly turn a tag on/off.
          </p>
          <label className="block text-sm">
            Video URL (optional)
            <input
              className={inputClass}
              value={form.video ?? ""}
              onChange={(e) => update({ video: e.target.value })}
            />
          </label>
        </section>
        <section className="space-y-4 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Colour Variants</h2>
          {form.colorVariants.map((variant, index) => (
            <div key={variant.variantId || index} className="rounded-lg border">
              <div className="flex items-center justify-between gap-3 p-4">
                <button
                  type="button"
                  className="text-left font-medium"
                  aria-expanded={expanded === index}
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  {variant.productTitle || variant.color || `Colour ${index + 1}`} —{" "}
                  {variant.inStock === false ? "Sold Out" : "In Stock"}
                </button>
                <button
                  type="button"
                  className="text-sm text-red-700"
                  onClick={() =>
                    update({ colorVariants: form.colorVariants.filter((_, i) => i !== index) })
                  }
                >
                  Remove colour
                </button>
              </div>
              {expanded === index && (
                <div className="space-y-4 border-t p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      Colour Name
                      <input
                        className={inputClass}
                        value={variant.color}
                        onChange={(e) => updateVariant(index, { color: e.target.value })}
                      />
                    </label>
                    <label className="text-sm">
                      Colour Key
                      <input
                        className={inputClass}
                        value={variant.slug}
                        readOnly={product?.colorVariants?.some(
                          (existing) => existing.slug === variant.slug,
                        )}
                        onChange={(e) => updateVariant(index, { slug: e.target.value })}
                      />
                      <span className="text-xs text-gray-600">
                        Existing colour keys stay fixed for carts and wishlists; edit the page slug
                        to change the URL.
                      </span>
                    </label>
                    <label className="text-sm">
                      Individual Page Slug
                      <input
                        className={inputClass}
                        value={variant.pageSlug ?? ""}
                        placeholder="e.g. cordia-bag-black"
                        onChange={(e) => updateVariant(index, { pageSlug: e.target.value })}
                      />
                    </label>
                    <label className="text-sm">
                      Product Name for this Colour
                      <input
                        className={inputClass}
                        value={variant.productTitle ?? ""}
                        onChange={(e) => updateVariant(index, { productTitle: e.target.value })}
                      />
                    </label>
                    <label className="text-sm">
                      Price (₹)
                      <input
                        min={1}
                        step={1}
                        type="number"
                        className={inputClass}
                        value={variant.price ?? ""}
                        onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                      />
                    </label>
                    <label className="text-sm">
                      Compare At Price (₹)
                      <input
                        min={1}
                        step={1}
                        type="number"
                        className={inputClass}
                        value={variant.compareAtPrice ?? ""}
                        onChange={(e) =>
                          updateVariant(index, {
                            compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </label>
                    <label className="text-sm">
                      Colour Hex (optional)
                      <input
                        className={inputClass}
                        value={variant.hex ?? ""}
                        onChange={(e) => updateVariant(index, { hex: e.target.value })}
                      />
                    </label>
                    <label className="text-sm">
                      Stock Quantity (optional)
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className={inputClass}
                        value={variant.stockQty ?? ""}
                        onChange={(e) =>
                          updateVariant(index, {
                            stockQty: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">
                    URL: {productHref(form, variant)}. Leave the page slug empty to retain the
                    existing colour URL.
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={variant.inStock === false}
                      onChange={(e) => updateVariant(index, { inStock: !e.target.checked })}
                    />
                    Sold out for this colour
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {tags.map(([key, label]) => (
                      <label key={key} className="text-sm">
                        {label}
                        <select
                          className={inputClass}
                          value={variant[key] === undefined ? "inherit" : String(variant[key])}
                          onChange={(e) =>
                            updateVariant(index, {
                              [key]:
                                e.target.value === "inherit"
                                  ? undefined
                                  : e.target.value === "true",
                            })
                          }
                        >
                          <option value="inherit">Use product setting</option>
                          <option value="true">On</option>
                          <option value="false">Off</option>
                        </select>
                      </label>
                    ))}
                  </div>
                  <fieldset className="space-y-3 rounded-lg border p-4">
                    <legend className="px-1 text-sm font-medium">Homepage section order</legend>
                    <p className="text-xs text-gray-600">
                      Tag as many colours as you want. New Arrivals, Most Trending and Best Sellers
                      require their tag and a number. Shop by Category only needs a number. Each
                      section or category tab shows the first four, lowest number first. Leave blank
                      to exclude this colour. Equal numbers are ordered by product ID, then colour
                      key.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {HOMEPAGE_SECTIONS.map(({ tag, label }) => (
                        <label key={tag} className="text-sm">
                          {label} rank
                          <input
                            type="number"
                            min={1}
                            step={1}
                            className={inputClass}
                            placeholder="Not on homepage"
                            value={variant.homepageRanks?.[tag] ?? ""}
                            onChange={(e) =>
                              updateVariant(index, {
                                homepageRanks: {
                                  ...variant.homepageRanks,
                                  [tag]: e.target.value === "" ? undefined : Number(e.target.value),
                                },
                              })
                            }
                          />
                          {variant.homepageRanks?.[tag] !== undefined &&
                            !hasProductTag(form, tag, variant) && (
                              <span className="text-xs text-amber-700">
                                Turn on the {label} tag above to display this colour.
                              </span>
                            )}
                        </label>
                      ))}
                      <label className="text-sm">
                        Shop by Category rank
                        <input
                          type="number"
                          min={1}
                          step={1}
                          className={inputClass}
                          placeholder="Not on homepage"
                          value={variant.homepageRanks?.shopByCategory ?? ""}
                          onChange={(e) =>
                            updateVariant(index, {
                              homepageRanks: {
                                ...variant.homepageRanks,
                                shopByCategory:
                                  e.target.value === "" ? undefined : Number(e.target.value),
                              },
                            })
                          }
                        />
                        <span className="text-xs text-gray-600">
                          Ranks this colour within its product group&apos;s selected category only.
                        </span>
                      </label>
                    </div>
                  </fieldset>
                  <ProductImageEditor
                    images={orderedProductImages(variant.image, variant.gallery)}
                    path={`products/${form.id}/variants/${variant.variantId}`}
                    onChange={(images) => setImages(images, index)}
                    onBusy={setBusy}
                  />
                  <p className="text-xs text-gray-600">
                    These images and details belong only to this colour. They appear on its product
                    page and the selected colour is carried through cart, checkout and orders.
                  </p>
                  <DetailsEditor
                    description={variant.description ?? ""}
                    features={variant.features ?? []}
                    specs={variant.specs ?? {}}
                    shippingReturns={variant.shippingReturns ?? ""}
                    onChange={(value) => updateVariant(index, value)}
                  />
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="rounded border px-4 py-2 text-sm"
            onClick={() => {
              update({
                colorVariants: [
                  ...form.colorVariants,
                  {
                    variantId: crypto.randomUUID(),
                    color: "",
                    slug: "",
                    productTitle: "",
                    price: form.price,
                    description: "",
                    features: [],
                    specs: {},
                    shippingReturns: DEFAULT_SHIPPING_RETURNS,
                    image: "",
                    gallery: [],
                    inStock: true,
                  },
                ],
              });
              setExpanded(form.colorVariants.length);
            }}
          >
            Add colour variant
          </button>
        </section>
      </fieldset>
    </form>
  );
}
