"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./_components/checkout-form";
import useBookingCartStore from "@/lib/store/use-booking-cart-store";
import LoadingScreen from "@/components/ui/loading-screen";
import ErrorPage from "@/components/error-page";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Plane, Hotel as HotelIcon, Car } from "lucide-react";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice } = useBookingCartStore();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-multi-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items,
            currency: "USD",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setGroupId(data.groupId);
        setIsLoading(false);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError("Failed to initialize checkout. Please try again.");
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (items.length === 0) {
    return null;
  }

  const totalAmount = getTotalPrice();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {item.type === "flight" && <Plane className="w-4 h-4 text-blue-600" />}
                      {item.type === "hotel" && <HotelIcon className="w-4 h-4 text-green-600" />}
                      {item.type === "car" && <Car className="w-4 h-4 text-orange-600" />}
                      <span className="capitalize">{item.type}</span>
                    </div>
                    <span className="font-medium">
                      $
                      {item.type === "flight"
                        ? parseFloat(item.data.price?.grandTotal || "0").toFixed(2)
                        : item.type === "hotel"
                          ? item.data.pricing?.totalPrice?.toFixed(2)
                          : item.data.pricing?.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">USD</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Secure payment powered by Stripe</p>
                <p>• Your booking will be confirmed instantly</p>
                <p>• You&apos;ll receive a confirmation email</p>
              </div>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            {clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#2563eb",
                      colorBackground: "#ffffff",
                      colorText: "#1f2937",
                      colorDanger: "#ef4444",
                      fontFamily: "system-ui, sans-serif",
                      borderRadius: "8px",
                    },
                  },
                }}
              >
                <CheckoutForm
                  amount={totalAmount}
                  groupId={groupId}
                  itemCount={items.length}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
