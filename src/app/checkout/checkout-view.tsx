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
  Loader2,
} from "lucide-react";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { UPIPayment } from "@/components/payment/upi-payment";
import { CardPayment } from "@/components/payment/card-payment";

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
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

function emptyAddress(): Address {
  return {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  };
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
  try {
    localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(addr));
  } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CheckoutView() {
  const items = useCart((s) => s.items);
  const isLoading = useCart((s) => s.isLoading);
  const clearCart = useCart((s) => s.clear);
  const { user, openAuthModal } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [address, setAddress] = useState<Address>(emptyAddress());
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const upiId = "";
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load saved address on mount
  useEffect(() => {
    setMounted(true);
    const saved = loadSavedAddress();
    if (saved.fullName) setAddress(saved);
  }, []);

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const hasItems = items.length > 0;
  const shipping = 0;
  const subtotalWithShipping = subtotal + shipping;
  const codCharges = payment === "cod" ? 100 : 0;

  const total = subtotalWithShipping + codCharges;

  // ── Wait for cart to load ────────────────────────────────────────────────
  if (!mounted || isLoading) {
    return (
      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <h1 className="mt-5 font-display text-3xl">Loading checkout...</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we prepare your order.
          </p>
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
          <div className="bg-card mt-6 w-full space-y-1 rounded-xl border border-border p-4 text-left text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Delivery to
            </p>
            <p className="font-medium">{address.fullName}</p>
            <p className="text-muted-foreground">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ""}
            </p>
            <p className="text-muted-foreground">
              {address.city}, {address.state} – {address.pincode}
            </p>
            <p className="text-muted-foreground">📞 {address.phone}</p>
          </div>
          <div className="bg-card mt-4 w-full rounded-xl border border-border p-4 text-left text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Payment
            </p>
            <p className="font-medium capitalize">
              {payment === "cod"
                ? "Cash on Delivery"
                : payment === "upi"
                  ? `UPI (${upiId})`
                  : "Debit / Credit Card"}
            </p>
          </div>
          <div className="mt-6 flex w-full gap-3">
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

  if (!hasItems) {
    return (
      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </span>
          <h1 className="mt-5 font-display text-3xl">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add at least one product to continue checkout.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Browse Products</Link>
          </Button>
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
    if (!user) {
      openAuthModal("Please log in to proceed to checkout.");
      return;
    }
    if (!validateAddress()) return;
    saveAddress(address);
    setStep(2);
  }

  // ── Place order ────────────────────────────────────────────────────────────
  async function placeOrder() {
    if (!user) {
      openAuthModal("Please log in to place your order.");
      return;
    }
    if (payment === "upi" && !/^[\w.\-]+@[\w]+$/.test(upiId)) {
      alert("Please enter a valid UPI ID (e.g. name@upi).");
      return;
    }
    setPlacing(true);
    const id = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const paymentLabel =
      payment === "cod" ? "Cash on Delivery" : payment === "upi" ? `UPI: ${upiId}` : "Card";
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

  // ── Handle UPI payment success ──────────────────────────────────────────────
  async function handleUPISuccess(transactionId: string) {
    if (!user) {
      openAuthModal("Please log in to complete your order.");
      return;
    }

    try {
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
        paymentMethod: `UPI (${upiId})`,
        paymentStatus: "paid",
        paymentId: transactionId,
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
      alert(
        "Order saved but could not record in system. Please contact support with Transaction ID: " +
          transactionId,
      );
    }
  }

  // ── Handle Card payment success ─────────────────────────────────────────────
  async function handleCardSuccess(paymentId: string) {
    if (!user) {
      openAuthModal("Please log in to complete your order.");
      return;
    }

    try {
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
        paymentMethod: "Debit / Credit Card",
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
      alert(
        "Order saved but could not record in system. Please contact support with Payment ID: " +
          paymentId,
      );
    }
  }

  return (
    <section className="min-h-screen overflow-x-hidden bg-background">
      {/* Header */}
      <div className="bg-card sticky top-0 z-40 w-full border-b border-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="font-display text-xl font-bold text-foreground md:text-2xl">
                  Secure Checkout
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">Your order is safe with us</p>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-muted-foreground">TOTAL</p>
              <p className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
                {formatINR(total)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <StepBar step={step} />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left panel */}
          <div>
            {/* Step 0 – Order Summary */}
            {step === 0 && (
              <div className="bg-card overflow-hidden rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3 border-b border-border bg-muted px-6 py-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Your Items
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {items.length} item{items.length !== 1 ? "s" : ""} in cart
                    </p>
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product.id}
                      className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                        <p className="mt-1 text-xs capitalize text-slate-500">
                          {product.category.replace("-", " ")}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            Qty: {quantity}
                          </span>
                          <p className="text-sm font-bold text-slate-900">
                            {formatINR(product.price * quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border bg-muted px-6 py-4">
                  <Button
                    size="lg"
                    className="w-full rounded-lg bg-primary font-semibold text-white hover:bg-primary/90"
                    onClick={() => {
                      if (!user) {
                        openAuthModal("Please log in to proceed to checkout.");
                        return;
                      }
                      setStep(1);
                    }}
                  >
                    Proceed to Address <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1 – Delivery Address */}
            {step === 1 && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Delivery Address
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>
                <div className="space-y-5 px-6 py-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full Name *" error={errors.fullName}>
                      <input
                        type="text"
                        className={inputCls(!!errors.fullName)}
                        placeholder="Ramesh Kumar"
                        value={address.fullName}
                        onChange={(e) => {
                          setAddress((a) => ({ ...a, fullName: e.target.value }));
                          setErrors((e2) => ({ ...e2, fullName: undefined }));
                        }}
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
                        onChange={(e) => {
                          setAddress((a) => ({
                            ...a,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          }));
                          setErrors((e2) => ({ ...e2, phone: undefined }));
                        }}
                      />
                    </Field>
                  </div>
                  <Field label="Address Line 1 *" error={errors.addressLine1}>
                    <input
                      type="text"
                      className={inputCls(!!errors.addressLine1)}
                      placeholder="House/Flat No., Street, Area"
                      value={address.addressLine1}
                      onChange={(e) => {
                        setAddress((a) => ({ ...a, addressLine1: e.target.value }));
                        setErrors((e2) => ({ ...e2, addressLine1: undefined }));
                      }}
                    />
                  </Field>
                  <Field label="Address Line 2 (Landmark, Apartment, etc.)">
                    <input
                      type="text"
                      className={inputCls(false)}
                      placeholder="Optional - helps delivery"
                      value={address.addressLine2}
                      onChange={(e) => setAddress((a) => ({ ...a, addressLine2: e.target.value }))}
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="City *" error={errors.city}>
                      <input
                        type="text"
                        className={inputCls(!!errors.city)}
                        placeholder="Mumbai"
                        value={address.city}
                        onChange={(e) => {
                          setAddress((a) => ({ ...a, city: e.target.value }));
                          setErrors((e2) => ({ ...e2, city: undefined }));
                        }}
                      />
                    </Field>
                    <Field label="State *" error={errors.state}>
                      <select
                        className={
                          inputCls(!!errors.state) + " cursor-pointer appearance-none bg-white"
                        }
                        value={address.state}
                        onChange={(e) => {
                          setAddress((a) => ({ ...a, state: e.target.value }));
                          setErrors((e2) => ({ ...e2, state: undefined }));
                        }}
                      >
                        <option value="">Select state</option>
                        {INDIA_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
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
                        onChange={(e) => {
                          setAddress((a) => ({
                            ...a,
                            pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                          }));
                          setErrors((e2) => ({ ...e2, pincode: undefined }));
                        }}
                      />
                    </Field>
                  </div>
                </div>
                <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <Button
                    size="lg"
                    className="w-full rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800"
                    onClick={handleContinueToPayment}
                  >
                    Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 – Payment */}
            {step === 2 && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                  <div className="rounded-lg bg-purple-50 p-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Payment Method
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Choose your preferred payment method
                    </p>
                  </div>
                </div>
                <div className="space-y-4 px-6 py-6">
                  {/* COD */}
                  <div>
                    <PaymentOption
                      id="cod"
                      selected={payment === "cod"}
                      onSelect={() => setPayment("cod")}
                      icon={<Banknote className="h-6 w-6 text-accent" />}
                      title="Cash on Delivery"
                      subtitle="Pay when your order arrives at your doorstep"
                    />
                  </div>

                  {/* UPI */}
                  <div>
                    <PaymentOption
                      id="upi"
                      selected={payment === "upi"}
                      onSelect={() => setPayment("upi")}
                      icon={<Smartphone className="h-6 w-6 text-primary" />}
                      title="UPI Payment"
                      subtitle="Pay instantly using GPay, PhonePe, Paytm, BHIM"
                    />
                    {payment === "upi" && (
                      <div className="ml-14 mt-4 space-y-3">
                        <UPIPayment
                          amount={total}
                          upiId=""
                          email={user?.email || ""}
                          phone={address.phone || user?.phone || ""}
                          onSuccess={handleUPISuccess}
                          onError={(error) => alert(`UPI Payment Error: ${error}`)}
                          disabled={!user}
                        />
                      </div>
                    )}
                  </div>

                  {/* Card */}
                  <div>
                    <PaymentOption
                      id="card"
                      selected={payment === "card"}
                      onSelect={() => setPayment("card")}
                      icon={<CreditCard className="h-6 w-6 text-purple-600" />}
                      title="Debit / Credit Card"
                      subtitle="Visa, Mastercard, RuPay - Secure & PCI Compliant"
                    />
                    {payment === "card" && (
                      <div className="ml-14 mt-4 space-y-3">
                        <CardPayment
                          amount={total}
                          email={user?.email || ""}
                          name={address.fullName || user?.name || ""}
                          phone={address.phone || user?.phone || ""}
                          onSuccess={handleCardSuccess}
                          onError={(error) => alert(`Card Payment Error: ${error}`)}
                          disabled={!user}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {payment !== "card" && (
                  <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                    <Button
                      size="lg"
                      className="w-full rounded-lg bg-slate-900 font-semibold text-white hover:bg-slate-800"
                      onClick={placeOrder}
                      disabled={placing}
                    >
                      {placing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Place Order · {formatINR(total)}
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {payment === "card" && (
                  <div className="border-t border-slate-200 bg-blue-50/50 px-6 py-4 text-center">
                    <p className="text-xs text-slate-600">
                      ✓ Click the payment button above to complete your purchase securely
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel – Order summary */}
          <aside className="bg-card h-fit rounded-xl border border-border p-6 shadow-sm lg:sticky lg:top-28">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Order Summary
              </h2>
            </div>

            {step >= 1 && (
              <>
                <ul className="mb-4 space-y-3 border-b border-slate-200 pb-4">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex items-start gap-3 text-xs">
                      <div className="relative h-12 w-10 flex-shrink-0 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{product.name}</p>
                        <p className="mt-1 text-slate-500">Qty: {quantity}</p>
                      </div>
                      <p className="shrink-0 text-right font-bold text-slate-900">
                        {formatINR(product.price * quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">{formatINR(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium text-foreground">
                  {shipping === 0 ? "FREE" : formatINR(shipping)}
                </dd>
              </div>
              {codCharges > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">COD Charges</dt>
                  <dd className="font-medium text-foreground">{formatINR(codCharges)}</dd>
                </div>
              )}
            </div>

            <div className="mb-4 border-t border-border pt-4">
              <div className="flex items-center justify-between text-lg">
                <dt className="font-bold text-foreground">Total</dt>
                <dd className="text-xl font-bold text-foreground">{formatINR(total)}</dd>
              </div>
            </div>

            {step >= 1 && address.fullName && (
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  📍 Delivering To
                </p>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-foreground">{address.fullName}</p>
                  {address.addressLine1 && (
                    <p className="text-muted-foreground">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    </p>
                  )}
                  {address.city && (
                    <p className="text-muted-foreground">
                      {address.city}
                      {address.state ? `, ${address.state}` : ""}
                      {address.pincode ? ` – ${address.pincode}` : ""}
                    </p>
                  )}
                  {address.phone && (
                    <p className="mt-1.5 font-medium text-muted-foreground">📞 {address.phone}</p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-400 bg-red-50" : "border-border bg-card"} px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 ${hasError ? "focus:ring-red-200" : "focus:ring-muted"} focus:border-border transition-all placeholder:text-muted-foreground`;
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
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">✕ {error}</p>}
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
      className={`group flex w-full items-start gap-4 rounded-lg border-2 px-5 py-4 text-left transition-all ${
        selected
          ? "border-primary bg-muted shadow-md"
          : "bg-card border-border hover:border-primary hover:shadow-sm"
      }`}
    >
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          selected
            ? "border-primary bg-primary"
            : "bg-card border-border group-hover:border-primary"
        }`}
      >
        {selected && <div className="bg-card h-2 w-2 rounded-full" />}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${selected ? "text-foreground" : "text-foreground"}`}>
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="mt-1 text-xl">{icon}</div>
    </button>
  );
}

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all ${
                i < step
                  ? "bg-accent text-white"
                  : i === step
                    ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            <span
              className={`mt-2 text-xs font-bold tracking-wider ${i === step ? "text-foreground" : i < step ? "text-accent" : "text-muted-foreground"}`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-2 mb-4 h-1 flex-1 rounded-full transition-all ${i < step ? "bg-emerald-600" : "bg-slate-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
