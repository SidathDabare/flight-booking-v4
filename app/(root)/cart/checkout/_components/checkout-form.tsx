"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CreditCard, Loader2 } from "lucide-react";
import useBookingCartStore from "@/lib/store/use-booking-cart-store";

interface CheckoutFormProps {
  amount: number;
  groupId: string;
  itemCount: number;
}

export default function CheckoutForm({ amount, groupId, itemCount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useBookingCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    // Submit the form to validate fields
    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message || "An error occurred");
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/cart/payment-success?groupId=${groupId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded without redirect
        clearCart();
        router.push(`/cart/payment-success?groupId=${groupId}&payment_intent=${paymentIntent.id}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Information
        </h2>
        <p className="text-sm text-gray-600">
          Enter your payment details to complete the booking
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stripe Payment Element */}
        <div className="min-h-[200px]">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <p>{errorMessage}</p>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="space-y-4">
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/cart")}
              disabled={isProcessing}
              className="text-sm"
            >
              Return to Cart
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
          <p className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <strong>Secure Payment</strong>
          </p>
          <p>
            Your payment information is encrypted and processed securely by Stripe.
            We never store your card details.
          </p>
          <p className="mt-2">
            You&apos;re booking {itemCount} item{itemCount > 1 ? "s" : ""} with confirmation
            number: {groupId}
          </p>
        </div>
      </form>
    </Card>
  );
}
