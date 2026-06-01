"use client";

import { useState, useEffect } from "react";
import { CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
  createPaymentOrder,
  verifyPayment,
} from "@/lib/razorpay-service";

interface RazorpayCheckoutProps {
  amount: number;
  email: string;
  name: string;
  phone: string;
  orderId?: string;
  description?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function RazorpayCheckout({
  amount,
  email,
  name,
  phone,
  orderId,
  description,
  onSuccess,
  onError,
  disabled = false,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRazorpayScript().catch(() => {
      setError("Failed to load payment gateway");
    });
  }, []);

  const handlePaymentClick = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("💳 Starting payment process...");

      // Check if Razorpay keys are configured
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error("Payment gateway not configured. Please try again later or contact support.");
      }

      // Create order on backend
      console.log("📝 Creating order on backend...");
      const createOrderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          notes: {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
          },
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json() as { error?: string };
        throw new Error(errorData.error || `Order creation failed: ${createOrderResponse.status}`);
      }

      const orderData = await createOrderResponse.json() as { orderId?: string; error?: string };
      if (!orderData.orderId) {
        throw new Error("Failed to create order: No order ID returned");
      }

      const newOrderId = orderData.orderId;
      console.log(`✅ Order created: ${newOrderId}`);

      // Open Razorpay checkout
      console.log("🎯 Opening Razorpay checkout...");
      await openRazorpayCheckout({
        orderId: newOrderId,
        amount: amount,
        currency: "INR",
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        email: email,
        name: name,
        phone: phone,
        description: description || "Kibana Premium Vegan Leather Handbags",
        onSuccess: async (response) => {
          try {
            console.log("💰 Payment successful, verifying...");
            // Verify payment
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            console.log("✅ Payment verified successfully");
            // Payment verified
            onSuccess?.(response.razorpay_payment_id);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Verification failed";
            console.error("❌ Payment verification error:", message);
            setError(message);
            onError?.(message);
          }
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Payment failed";
          console.error("❌ Payment error:", message);
          setError(message);
          onError?.(message);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process payment";
      console.error("❌ Payment processing error:", message);
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <CreditCard className="h-4 w-4 flex-shrink-0" />
        <span>Secure payment powered by Razorpay</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        onClick={handlePaymentClick}
        disabled={disabled || loading || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{amount.toLocaleString("en-IN")}
          </>
        )}
      </Button>

      {!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
        <p className="text-xs text-muted-foreground">
          Payment gateway not configured. Please contact support.
        </p>
      )}
    </div>
  );
}
