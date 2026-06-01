/**
 * Razorpay Payment Service
 * Handles payment creation, checkout, and verification
 */

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  email: string;
  name: string;
  phone: string;
  description: string;
  onSuccess?: (response: RazorpayPaymentResponse) => void;
  onError?: (error: Error) => void;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Load Razorpay script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay payment checkout
 */
export function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  const {
    orderId,
    amount,
    currency,
    keyId,
    email,
    name,
    phone,
    description,
    onSuccess,
    onError,
  } = options;

  // Ensure Razorpay script is loaded
  const razorpayWindow = window as any;
  if (!razorpayWindow.Razorpay) {
    const error = new Error("Razorpay script not loaded");
    onError?.(error);
    return;
  }

  const checkout = new razorpayWindow.Razorpay({
    key: keyId,
    order_id: orderId,
    amount: Math.round(amount * 100), // Amount in paise
    currency: currency || "INR",
    name: "Kibana",
    description: description || "Premium Vegan Leather Handbags",
    image: "/logo.png", // Add your logo here
    prefill: {
      email: email,
      name: name,
      contact: phone,
    },
    theme: {
      color: "#C9A77B", // Kibana tan color
    },
    handler: function (response: RazorpayPaymentResponse) {
      onSuccess?.(response);
    },
    modal: {
      ondismiss: function () {
        onError?.(new Error("Payment cancelled by user"));
      },
    },
  });

  checkout.open();
}

/**
 * Create payment order
 */
export async function createPaymentOrder(
  amount: number,
  receipt: string,
  notes?: Record<string, string>
): Promise<{ orderId: string; amount: number }> {
  const response = await fetch("/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt,
      notes: notes || {},
    }),
  });

  const data = await response.json() as { 
    success?: boolean;
    orderId?: string;
    amount?: number;
    error?: string;
  };

  if (!response.ok || !data.orderId) {
    throw new Error(data.error || "Failed to create order");
  }

  return {
    orderId: data.orderId,
    amount: data.amount || amount,
  };
}

/**
 * Verify payment
 */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch("/api/payments/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    }),
  });

  const data = await response.json() as {
    success?: boolean;
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Payment verification failed");
  }

  return {
    success: data.success || false,
    message: data.message || "Payment verified",
  };
}
