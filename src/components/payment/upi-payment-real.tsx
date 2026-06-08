"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UPIPaymentProps {
  amount: number;
  upiId: string;
  email: string;
  phone: string;
  onSuccess: (transactionId: string) => Promise<void>;
  onError: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function UPIPayment({
  amount,
  upiId,
  email,
  phone,
  onSuccess,
  onError,
  disabled = false,
}: UPIPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUPIPayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 1: Create Razorpay order on backend
      const orderResponse = await fetch("/api/payments/upi/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          email,
          phone,
          name: upiId.split("@")[0],
          orderId: `upi_${Date.now()}`,
        }),
      });

      const orderData = (await orderResponse.json()) as {
        success?: boolean;
        orderId?: string;
        razorpayKeyId?: string;
        error?: string;
      };

      if (!orderData.success || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Step 2: Open Razorpay Checkout with UPI preference
      const options = {
        key: orderData.razorpayKeyId,
        amount: amount,
        currency: "INR",
        order_id: orderData.orderId,
        prefill: {
          email,
          contact: phone,
        },
        method: {
          upi: true,
          card: false,
          wallet: false,
          netbanking: false,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = (await verifyResponse.json()) as {
              success?: boolean;
              paymentId?: string;
              error?: string;
            };

            if (!verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setTransactionId(response.razorpay_payment_id);
            setSuccess(true);
            console.log("✅ UPI Payment Successful:", response.razorpay_payment_id);

            // Call success handler
            await onSuccess(response.razorpay_payment_id);
          } catch (err) {
            const errorMsg =
              err instanceof Error ? err.message : "Payment verification failed";
            setError(errorMsg);
            onError(errorMsg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled by user");
          },
        },
      };

      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        throw new Error("Razorpay checkout not loaded");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment initiation failed";
      setError(errorMsg);
      onError(errorMsg);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Payment Successful!</p>
          <p className="text-xs text-emerald-700">Transaction ID: {transactionId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <Button
        onClick={handleUPIPayment}
        disabled={disabled || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing UPI Payment...
          </>
        ) : (
          <>📱 Pay with UPI ₹{amount.toLocaleString("en-IN")}</>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        💳 You will be redirected to Razorpay to complete payment securely
      </p>
    </div>
  );
}
