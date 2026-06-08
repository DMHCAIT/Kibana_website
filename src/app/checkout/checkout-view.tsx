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
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { RazorpayCheckout } from "@/components/payment/razorpay-checkout";
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
      alert("Order saved but could not record in system. Please contact support with Transaction ID: " + transactionId);
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
      alert("Order saved but could not record in system. Please contact support with Payment ID: " + paymentId);
    }
  }

  return (
    <section className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40 shadow-sm w-full">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">Secure Checkout</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Your order is safe with us</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground font-medium">TOTAL</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">{formatINR(total)}</p>
            </div>
          </div>
          <div className="mt-4">
            <StepBar step={step} />
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] w-full">
          {/* Left panel */}
          <div>
            {/* Step 0 – Order Summary */}
            {step === 0 && (
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-muted">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Your Items</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex gap-4 px-6 py-4 items-start hover:bg-slate-50/50 transition-colors">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                        <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500 capitalize mt-1">{product.category.replace("-", " ")}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Qty: {quantity}</span>
                          <p className="text-sm font-bold text-slate-900">{formatINR(product.price * quantity)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-6 py-4 border-t border-border bg-muted">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold" onClick={() => {
                    if (!user) { openAuthModal("Please log in to proceed to checkout."); return; }
                    setStep(1);
                  }}>
                    Proceed to Address <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1 – Delivery Address */}
            {step === 1 && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Delivery Address</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Where should we deliver your order?</p>
                  </div>
                </div>
                <div className="px-6 py-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
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
                  <Field label="Address Line 2 (Landmark, Apartment, etc.)">
                    <input
                      type="text"
                      className={inputCls(false)}
                      placeholder="Optional - helps delivery"
                      value={address.addressLine2}
                      onChange={(e) => setAddress((a) => ({ ...a, addressLine2: e.target.value }))}
                    />
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-5">
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
                        className={inputCls(!!errors.state) + " bg-white cursor-pointer appearance-none"}
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
                <div className="px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold" onClick={handleContinueToPayment}>
                    Continue to Payment <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 – Payment */}
            {step === 2 && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Payment Method</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Choose your preferred payment method</p>
                  </div>
                </div>
                <div className="px-6 py-6 space-y-4">
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
                    {payment === "cod" && (
                      <div className="mt-3 ml-14 p-3 bg-muted border border-border rounded-lg">
                        <p className="text-xs font-semibold text-foreground">🚚 COD Charge: +₹50</p>
                        <p className="text-xs text-muted-foreground mt-1">Added to your total</p>
                      </div>
                    )}
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
                      <div className="mt-4 ml-14 space-y-3">
                        <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                          <p className="text-xs font-bold text-emerald-700">💚 Get ₹50 Cashback!</p>
                        </div>
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
                      <div className="mt-4 ml-14 space-y-3">
                        <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                          <p className="text-xs font-bold text-emerald-700">💳 Get ₹50 Cashback!</p>
                        </div>
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
                  <div className="px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold" onClick={placeOrder} disabled={placing}>
                      {placing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Place Order · {formatINR(total)}
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {payment === "card" && (
                  <div className="px-6 py-4 border-t border-slate-200 bg-blue-50/50 text-center">
                    <p className="text-xs text-slate-600">✓ Click the payment button above to complete your purchase securely</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel – Order summary */}
          <aside className="rounded-xl border border-border bg-card shadow-sm p-6 h-fit lg:sticky lg:top-28">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Order Summary</h2>
            </div>
            
            {step >= 1 && (
              <>
                <ul className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex items-start gap-3 text-xs">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-slate-500 mt-1">Qty: {quantity}</p>
                      </div>
                      <p className="font-bold text-slate-900 shrink-0 text-right">{formatINR(product.price * quantity)}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium text-foreground">{shipping === 0 ? "FREE" : formatINR(shipping)}</dd>
              </div>
              {discount > 0 && step >= 2 && (
                <div className="flex justify-between items-center text-sm">
                  <dt className="font-medium text-accent">{discountLabel}</dt>
                  <dd className="font-bold text-accent">-{formatINR(discount)}</dd>
                </div>
              )}
              {codExtraCharge > 0 && step >= 2 && (
                <div className="flex justify-between items-center text-sm">
                  <dt className="font-medium text-foreground">🚚 COD Charge</dt>
                  <dd className="font-bold text-foreground">+{formatINR(codExtraCharge)}</dd>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between items-center text-lg">
                <dt className="font-bold text-foreground">Total</dt>
                <dd className="font-bold text-foreground text-xl">{formatINR(total)}</dd>
              </div>
            </div>

            {step >= 1 && address.fullName && (
              <div className="bg-muted rounded-lg p-4 border border-border">
                <p className="font-bold text-xs uppercase tracking-wider text-foreground mb-2">📍 Delivering To</p>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-foreground">{address.fullName}</p>
                  {address.addressLine1 && <p className="text-muted-foreground">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>}
                  {address.city && <p className="text-muted-foreground">{address.city}{address.state ? `, ${address.state}` : ""}{address.pincode ? ` – ${address.pincode}` : ""}</p>}
                  {address.phone && <p className="text-muted-foreground font-medium mt-1.5">📞 {address.phone}</p>}
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
      <label className="text-xs font-bold text-foreground mb-2 block uppercase tracking-wider">{label}</label>
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
      className={`w-full flex items-start gap-4 px-5 py-4 rounded-lg border-2 transition-all text-left group ${
        selected 
          ? "border-primary bg-muted shadow-md" 
          : "border-border bg-card hover:border-primary hover:shadow-sm"
      }`}
    >
      <div
        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          selected 
            ? "border-primary bg-primary" 
            : "border-border bg-card group-hover:border-primary"
        }`}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-card" />}
      </div>
      <div className="flex-1">
        <p className={`font-bold text-sm ${selected ? "text-foreground" : "text-foreground"}`}>{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="text-xl mt-1">{icon}</div>
    </button>
  );
}

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                i < step
                  ? "bg-accent text-white"
                  : i === step
                  ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            <span className={`mt-2 text-xs font-bold tracking-wider ${i === step ? "text-foreground" : i < step ? "text-accent" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-1 mx-2 mb-4 rounded-full transition-all ${i < step ? "bg-emerald-600" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
