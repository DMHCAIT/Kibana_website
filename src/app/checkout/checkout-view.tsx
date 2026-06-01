"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Check,
  ChevronRight,
  Banknote,
  Smartphone,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { RazorpayCheckout } from "@/components/payment/razorpay-checkout";

// ── Types ─────────────────────────────────────────────────────────────────────
type Address = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

type PaymentMethod = "cod" | "upi" | "card";

const SAVED_ADDRESS_KEY = "kibana-saved-address";
const STEPS = ["Order Summary", "Delivery Address", "Payment"] as const;
type Step = 0 | 1 | 2;

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

function emptyAddress(): Address {
  return { fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" };
}

function loadSavedAddress(): Address {
  if (typeof window === "undefined") return emptyAddress();
  try {
    return JSON.parse(localStorage.getItem(SAVED_ADDRESS_KEY) ?? "null") ?? emptyAddress();
  } catch {
    return emptyAddress();
  }
}

function saveAddress(addr: Address) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(addr)); } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CheckoutView() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const { user, openAuthModal } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [address, setAddress] = useState<Address>(emptyAddress());
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [upiId, setUpiId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [orderId, setOrderId] = useState<string | null>(null);

  // Load saved address on mount
  useEffect(() => {
    const saved = loadSavedAddress();
    if (saved.fullName) setAddress(saved);
  }, []);

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 99;
  const subtotalWithShipping = subtotal + shipping;
  
  // Cashback/Discount or Extra charges based on payment method
  const discount = payment === "card" ? 50 : payment === "upi" ? 50 : 0;
  const discountLabel = payment === "card" ? "💳 Cashback" : payment === "upi" ? "📱 Cashback" : "";
  const codExtraCharge = payment === "cod" ? 50 : 0;
  const total = Math.max(0, subtotalWithShipping - discount + codExtraCharge);

  // Empty cart redirect
  if (items.length === 0 && !orderId) {
    return (
      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </span>
          <h1 className="mt-4 font-display text-3xl">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add some items before checking out.</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/shop">Shop Bags</Link>
          </Button>
        </div>
      </section>
    );
  }

  // ── Order confirmed screen ────────────────────────────────────────────────
  if (orderId) {
    return (
      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-700" />
          </span>
          <h1 className="mt-5 font-display text-3xl">Order Placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you, <strong>{address.fullName}</strong>. Your order{" "}
            <strong>#{orderId.slice(-8).toUpperCase()}</strong> has been confirmed.
          </p>
          <div className="mt-6 w-full rounded-xl border border-border bg-card p-4 text-left text-sm space-y-1">
            <p className="font-semibold text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Delivery to</p>
            <p className="font-medium">{address.fullName}</p>
            <p className="text-muted-foreground">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
            <p className="text-muted-foreground">{address.city}, {address.state} – {address.pincode}</p>
            <p className="text-muted-foreground">📞 {address.phone}</p>
          </div>
          <div className="mt-4 w-full rounded-xl border border-border bg-card p-4 text-left text-sm">
            <p className="font-semibold text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Payment</p>
            <p className="font-medium capitalize">
              {payment === "cod" ? "Cash on Delivery" : payment === "upi" ? `UPI (${upiId})` : "Debit / Credit Card"}
            </p>
          </div>
          <div className="mt-6 flex gap-3 w-full">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateAddress(): boolean {
    const e: Partial<Address> = {};
    if (!address.fullName.trim()) e.fullName = "Full name is required.";
    if (!/^\d{10}$/.test(address.phone)) e.phone = "Enter a valid 10-digit phone number.";
    if (!address.addressLine1.trim()) e.addressLine1 = "Address is required.";
    if (!address.city.trim()) e.city = "City is required.";
    if (!address.state) e.state = "Select a state.";
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Enter a valid 6-digit pincode.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinueToPayment() {
    if (!user) { openAuthModal("Please log in to proceed to checkout."); return; }
    if (!validateAddress()) return;
    saveAddress(address);
    setStep(2);
  }

  // ── Place order ────────────────────────────────────────────────────────────
  async function placeOrder() {
    if (!user) { openAuthModal("Please log in to place your order."); return; }
    if (payment === "upi" && !/^[\w.\-]+@[\w]+$/.test(upiId)) {
      alert("Please enter a valid UPI ID (e.g. name@upi).");
      return;
    }
    setPlacing(true);
    const id = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const paymentLabel = payment === "cod" ? "Cash on Delivery" : payment === "upi" ? `UPI: ${upiId}` : "Card";
    const shippingText = `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? ", " + address.addressLine2 : ""}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`;
    const body = {
      id,
      user: { name: user.name, email: user.email, id: user.id },
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      total,
      status: "pending",
      shippingAddress: shippingText,
      paymentMethod: paymentLabel,
      paymentStatus: payment === "cod" ? "pending" : "paid",
      placedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to place order");
      clearCart();
      setOrderId(id);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  // ── Handle Razorpay payment success ────────────────────────────────────────
  async function handleRazorpaySuccess(paymentId: string) {
    if (!user) {
      openAuthModal("Please log in to complete your order.");
      return;
    }

    try {
      setPlacing(true);
      const id = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const shippingText = `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? ", " + address.addressLine2 : ""}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`;
      
      const body = {
        id,
        user: { name: user.name, email: user.email, id: user.id },
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
        })),
        total,
        status: "confirmed",
        shippingAddress: shippingText,
        paymentMethod: "Razorpay - Debit/Credit Card",
        paymentStatus: "paid",
        paymentId: paymentId,
        placedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save order");

      clearCart();
      setOrderId(id);
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Order saved but could not record in system. Please contact support with Payment ID: " + paymentId);
    } finally {
      setPlacing(false);
    }
  }

  // ── Step progress bar ──────────────────────────────────────────────────────
  function StepBar() {
    return (
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-emerald-600 text-white"
                    : i === step
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`mt-1 text-[10px] tracking-wide font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-emerald-600" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="container py-6 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
      </div>

      <StepBar />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <div>
          {/* Step 0 – Order Summary */}
          {step === 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">Your Items</h2>
              </div>
              <ul className="divide-y divide-border">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-3 px-4 py-3 sm:px-5 sm:py-4 items-center">
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{product.category.replace("-", " ")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">{formatINR(product.price * quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-4 border-t border-border">
                <Button size="lg" className="w-full" onClick={() => {
                  if (!user) { openAuthModal("Please log in to proceed to checkout."); return; }
                  setStep(1);
                }}>
                  Continue to Address <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1 – Delivery Address */}
          {step === 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">Delivery Address</h2>
              </div>
              <div className="px-5 py-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name *" error={errors.fullName}>
                    <input
                      type="text"
                      className={inputCls(!!errors.fullName)}
                      placeholder="Ramesh Kumar"
                      value={address.fullName}
                      onChange={(e) => { setAddress((a) => ({ ...a, fullName: e.target.value })); setErrors((e2) => ({ ...e2, fullName: undefined })); }}
                    />
                  </Field>
                  <Field label="Phone Number *" error={errors.phone}>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className={inputCls(!!errors.phone)}
                      placeholder="9876543210"
                      value={address.phone}
                      onChange={(e) => { setAddress((a) => ({ ...a, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })); setErrors((e2) => ({ ...e2, phone: undefined })); }}
                    />
                  </Field>
                </div>
                <Field label="Address Line 1 *" error={errors.addressLine1}>
                  <input
                    type="text"
                    className={inputCls(!!errors.addressLine1)}
                    placeholder="House/Flat No., Street, Area"
                    value={address.addressLine1}
                    onChange={(e) => { setAddress((a) => ({ ...a, addressLine1: e.target.value })); setErrors((e2) => ({ ...e2, addressLine1: undefined })); }}
                  />
                </Field>
                <Field label="Address Line 2 (optional)">
                  <input
                    type="text"
                    className={inputCls(false)}
                    placeholder="Landmark, Apartment, etc."
                    value={address.addressLine2}
                    onChange={(e) => setAddress((a) => ({ ...a, addressLine2: e.target.value }))}
                  />
                </Field>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="City *" error={errors.city}>
                    <input
                      type="text"
                      className={inputCls(!!errors.city)}
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) => { setAddress((a) => ({ ...a, city: e.target.value })); setErrors((e2) => ({ ...e2, city: undefined })); }}
                    />
                  </Field>
                  <Field label="State *" error={errors.state}>
                    <select
                      className={inputCls(!!errors.state) + " bg-background cursor-pointer"}
                      value={address.state}
                      onChange={(e) => { setAddress((a) => ({ ...a, state: e.target.value })); setErrors((e2) => ({ ...e2, state: undefined })); }}
                    >
                      <option value="">Select state</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Pincode *" error={errors.pincode}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className={inputCls(!!errors.pincode)}
                      placeholder="400001"
                      value={address.pincode}
                      onChange={(e) => { setAddress((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })); setErrors((e2) => ({ ...e2, pincode: undefined })); }}
                    />
                  </Field>
                </div>
              </div>
              <div className="px-5 pb-5">
                <Button size="lg" className="w-full" onClick={handleContinueToPayment}>
                  Continue to Payment <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 – Payment */}
          {step === 2 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">Payment Method</h2>
              </div>
              <div className="px-5 py-5 space-y-3">
                {/* COD */}
                <div>
                  <PaymentOption
                    id="cod"
                    selected={payment === "cod"}
                    onSelect={() => setPayment("cod")}
                    icon={<Banknote className="h-5 w-5 text-emerald-700" />}
                    title="Cash on Delivery"
                    subtitle="Pay when your order arrives"
                  />
                  {payment === "cod" && <p className="text-xs text-orange-600 ml-9 mt-1">🚚 COD handling charge: +₹50</p>}
                </div>
                {/* UPI */}
                <PaymentOption
                  id="upi"
                  selected={payment === "upi"}
                  onSelect={() => setPayment("upi")}
                  icon={<Smartphone className="h-5 w-5 text-blue-600" />}
                  title="UPI"
                  subtitle="Pay via any UPI app (GPay, PhonePe, Paytm…)"
                />
                {payment === "upi" && (
                  <div className="ml-8 mt-1 space-y-1">
                    <p className="text-xs text-blue-600 font-medium">📱 Get ₹50 cashback!</p>
                    <input
                      type="text"
                      className={inputCls(false)}
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value.trim())}
                    />
                  </div>
                )}
                {/* Card */}
                <PaymentOption
                  id="card"
                  selected={payment === "card"}
                  onSelect={() => setPayment("card")}
                  icon={<CreditCard className="h-5 w-5 text-purple-600" />}
                  title="Debit / Credit Card"
                  subtitle="Visa, Mastercard, RuPay"
                />
                {payment === "card" && (
                  <div className="ml-8 mt-1 space-y-1">
                    <p className="text-xs text-purple-600 font-medium">💳 Get ₹50 cashback!</p>
                    <RazorpayCheckout
                      amount={total}
                      email={user?.email || ""}
                      name={address.fullName || user?.name || ""}
                      phone={address.phone || user?.phone || ""}
                      description="Kibana Premium Vegan Leather Handbags"
                      onSuccess={(paymentId) => {
                        handleRazorpaySuccess(paymentId);
                      }}
                      onError={(error) => {
                        alert(`Payment failed: ${error}`);
                      }}
                      disabled={!user}
                    />
                  </div>
                )}
              </div>
              <div className="px-5 pb-5">
                {payment === "card" ? (
                  <p className="text-sm text-muted-foreground mb-3">Click the payment button above to complete your purchase with Razorpay</p>
                ) : (
                  <Button size="lg" className="w-full" onClick={placeOrder} disabled={placing}>
                    {placing ? "Placing order…" : `Place Order · ${formatINR(total)}`}
                    {!placing && <Check className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel – Order summary ─────────────────────────────────── */}
        <aside className="rounded-xl border border-border bg-card p-5 h-fit lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Order Summary</h2>
          {step >= 1 && (
            <ul className="mt-3 space-y-2">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-2 text-xs">
                  <div className="relative h-9 w-8 shrink-0 overflow-hidden rounded bg-muted">
                    <Image src={product.image} alt={product.name} fill sizes="32px" className="object-cover" />
                  </div>
                  <span className="flex-1 truncate text-muted-foreground">{product.name} × {quantity}</span>
                  <span className="font-medium shrink-0">{formatINR(product.price * quantity)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
            {discount > 0 && step >= 2 && (
              <div className="flex justify-between">
                <dt className="text-emerald-700 font-medium">{discountLabel}</dt>
                <dd className="text-emerald-700 font-medium">-{formatINR(discount)}</dd>
              </div>
            )}
            {codExtraCharge > 0 && step >= 2 && (
              <div className="flex justify-between">
                <dt className="text-orange-600 font-medium">🚚 COD Extra Charge</dt>
                <dd className="text-orange-600 font-medium">+{formatINR(codExtraCharge)}</dd>
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
          {step >= 1 && address.fullName && (
            <>
              <Separator className="my-3" />
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Delivering to</p>
                <p className="font-medium">{address.fullName}</p>
                {address.addressLine1 && <p className="text-muted-foreground">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>}
                {address.city && <p className="text-muted-foreground">{address.city}{address.state ? `, ${address.state}` : ""}{address.pincode ? ` – ${address.pincode}` : ""}</p>}
                {address.phone && <p className="text-muted-foreground">📞 {address.phone}</p>}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-destructive" : "border-border"} bg-background px-3 py-2.5 text-sm rounded-md outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PaymentOption({
  id: _id,
  selected,
  onSelect,
  icon,
  title,
  subtitle,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 transition-colors text-left ${
        selected ? "border-foreground bg-muted/50" : "border-border hover:border-foreground/30"
      }`}
    >
      <div
        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? "border-foreground" : "border-muted-foreground"
        }`}
      >
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-foreground" />}
      </div>
      {icon}
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}
