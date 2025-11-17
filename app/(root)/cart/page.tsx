"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useBookingCartStore from "@/lib/store/use-booking-cart-store";
import { Plane, Hotel as HotelIcon, Car, X, ShoppingCart, CreditCard } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, getTotalPrice, getFlights, getHotels, getCars, clearCart } =
    useBookingCartStore();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const flights = getFlights();
  const hotels = getHotels();
  const cars = getCars();

  const subtotal = getTotalPrice();
  const total = subtotal - discount;

  const handleApplyPromo = () => {
    // Mock promo code logic
    if (promoCode.toUpperCase() === "SAVE10") {
      setDiscount(subtotal * 0.1);
      alert("Promo code applied! 10% discount");
    } else if (promoCode) {
      alert("Invalid promo code");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Navigate to checkout page
    router.push("/cart/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Start planning your trip by searching for flights, hotels, or rental cars.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/flights")} variant="outline">
              <Plane className="w-4 h-4 mr-2" />
              Search Flights
            </Button>
            <Button onClick={() => router.push("/hotels")} variant="outline">
              <HotelIcon className="w-4 h-4 mr-2" />
              Search Hotels
            </Button>
            <Button onClick={() => router.push("/cars")} variant="outline">
              <Car className="w-4 h-4 mr-2" />
              Search Cars
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Booking Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flights */}
          {flights.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Plane className="w-5 h-5 mr-2" />
                Flights ({flights.length})
              </h2>
              <div className="space-y-4">
                {flights.map((item) => {
                  const flightData = item.type === "flight" ? item.data : null;
                  if (!flightData || item.type !== "flight") return null;

                  return (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Flight Booking</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            {flightData.itineraries[0]?.segments[0]?.departure.iataCode} →{" "}
                            {flightData.itineraries[0]?.segments[
                              flightData.itineraries[0].segments.length - 1
                            ]?.arrival.iataCode}
                          </div>
                          <div className="font-medium text-gray-900">
                            ${parseFloat(flightData.price?.grandTotal || "0").toFixed(2)} {flightData.price?.currency}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hotels */}
          {hotels.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <HotelIcon className="w-5 h-5 mr-2" />
                Hotels ({hotels.length})
              </h2>
              <div className="space-y-4">
                {hotels.map((item) => {
                  const hotelData = item.type === "hotel" ? item.data : null;
                  if (!hotelData || item.type !== "hotel") return null;

                  return (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">{hotelData.hotel.name}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            {hotelData.hotel.city}, {hotelData.hotel.country}
                          </div>
                          <div>{hotelData.room.name}</div>
                          <div>
                            {hotelData.stay.checkInDate} → {hotelData.stay.checkOutDate}
                          </div>
                          <div>
                            {hotelData.stay.numberOfNights} night{hotelData.stay.numberOfNights > 1 ? "s" : ""}
                          </div>
                          <div className="font-medium text-gray-900">
                            ${hotelData.pricing.totalPrice.toFixed(2)} {hotelData.pricing.currency}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cars */}
          {cars.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Car Rentals ({cars.length})
              </h2>
              <div className="space-y-4">
                {cars.map((item) => {
                  const carData = item.type === "car" ? item.data : null;
                  if (!carData || item.type !== "car") return null;

                  return (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">
                          {carData.vehicle.make} {carData.vehicle.model}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{carData.vendor.name}</div>
                          <div>{carData.vehicle.category} • {carData.vehicle.transmission}</div>
                          <div>
                            {carData.rental.pickupDate} → {carData.rental.dropoffDate}
                          </div>
                          <div>
                            {carData.rental.durationDays} day{carData.rental.durationDays > 1 ? "s" : ""}
                          </div>
                          <div className="font-medium text-gray-900">
                            ${carData.pricing.totalPrice.toFixed(2)} {carData.pricing.currency}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear Cart Button */}
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Are you sure you want to clear your cart?")) {
                clearCart();
              }
            }}
            className="w-full text-red-500 border-red-500 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            {/* Item Count */}
            <div className="space-y-2 mb-6">
              {flights.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Flights</span>
                  <span className="font-medium">{flights.length}</span>
                </div>
              )}
              {hotels.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hotels</span>
                  <span className="font-medium">{hotels.length}</span>
                </div>
              )}
              {cars.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Car Rentals</span>
                  <span className="font-medium">{cars.length}</span>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyPromo}
                  disabled={!promoCode}
                >
                  Apply
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Try: SAVE10 for 10% off</p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({promoCode})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">USD</div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
