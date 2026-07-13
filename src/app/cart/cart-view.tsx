"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { trackWishlist } from "@/lib/analytics";

export function CartView() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const { user, openAuthModal } = useAuth();
  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </span>
          <h1 className="mt-4 font-display text-3xl">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover totes, slings, and backpacks built for the everyday.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/shop">Shop Bags</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-6 md:py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Your Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        <ul className="bg-card divide-y divide-border rounded-xl border border-border">
          {items.map(({ product, quantity, selectedColorSlug }) => {
            const variant = selectedColorSlug
              ? product.colorVariants?.find((v) => v.slug === selectedColorSlug)
              : product.colorVariants?.[0];
            const displayName = variant?.productTitle || product.name;
            const displayImage = variant?.image || product.image;

            return (
            <li key={product.id} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
              <Link
                href={`/shop/${product.slug}${selectedColorSlug ? `?color=${selectedColorSlug}` : ""}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-24"
              >
                <Image
                  src={displayImage}
                  alt={displayName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/shop/${product.slug}${selectedColorSlug ? `?color=${selectedColorSlug}` : ""}`}
                    className="line-clamp-2 text-sm font-medium hover:underline"
                  >
                    {displayName}
                  </Link>
                  <button
                    aria-label="Remove"
                    onClick={() => {
                      remove(product.id);
                      // Track remove from cart event
                      trackWishlist(product, "remove", user?.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {product.category.replace("-", " ")}
                </p>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-md border border-border">
                    <button
                      aria-label="Decrease quantity"
                      className="inline-flex h-8 w-8 items-center justify-center hover:bg-muted"
                      onClick={() => setQuantity(product.id, Math.max(0, quantity - 1))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm">{quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      className="inline-flex h-8 w-8 items-center justify-center hover:bg-muted"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatINR(product.price * quantity)}</p>
                    {product.compareAtPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatINR(product.compareAtPrice * quantity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
            );
          })}
        </ul>

        <aside className="bg-card h-fit rounded-xl border border-border p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>

          <Button
            size="lg"
            className="mt-5 w-full"
            onClick={() => {
              if (!user) {
                openAuthModal("Please log in to proceed to checkout.");
              } else {
                router.push("/checkout");
              }
            }}
          >
            Checkout
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild size="sm" variant="ghost" className="mt-2 w-full">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}
