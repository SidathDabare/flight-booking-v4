"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/loading-screen";
import ErrorPage from "@/components/error-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hotel, HotelGuest } from "@/types/hotel";
import useHotelStore from "@/lib/store/use-hotel-store";
import useBookingCartStore from "@/lib/store/use-booking-cart-store";
import { MapPin, Star, Wifi, CheckCircle, Users } from "lucide-react";
import Image from "next/image";

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.hotelId as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [guests, setGuests] = useState<HotelGuest[]>([
    {
      id: "1",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      isMainGuest: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedHotel, checkInDate, checkOutDate, numberOfNights, setSelectedHotel } =
    useHotelStore();
  const { addHotel } = useBookingCartStore();

  useEffect(() => {
    // If we have a selected hotel in store, use it
    if (selectedHotel && selectedHotel.hotelId === hotelId) {
      setHotel(selectedHotel);
      setIsLoading(false);
    } else {
      // Otherwise fetch from API (for future implementation)
      setError("Hotel not found. Please search again.");
      setIsLoading(false);
    }
  }, [hotelId, selectedHotel]);

  const handleAddToCart = () => {
    if (!hotel || !selectedRoomId || !checkInDate || !checkOutDate) {
      alert("Please select a room and provide check-in/out dates");
      return;
    }

    const selectedRoom = hotel.rooms.find((r) => r.roomId === selectedRoomId);
    if (!selectedRoom) return;

    // Validate guests
    const mainGuest = guests.find((g) => g.isMainGuest);
    if (!mainGuest || !mainGuest.firstName || !mainGuest.email) {
      alert("Please provide main guest information");
      return;
    }

    // Create booking object
    const hotelBooking = {
      hotelId: hotel.hotelId,
      hotel: {
        name: hotel.name,
        address: hotel.location.address,
        city: hotel.location.city,
        country: hotel.location.country,
        rating: hotel.rating,
        image: hotel.images?.[0]?.url,
      },
      room: {
        roomId: selectedRoom.roomId,
        name: selectedRoom.name,
        bedType: selectedRoom.bedType,
        maxOccupancy: selectedRoom.maxOccupancy,
      },
      stay: {
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfNights: numberOfNights,
        numberOfGuests: guests.length,
        numberOfRooms: 1,
      },
      guests: guests.filter((g) => g.firstName && g.email),
      pricing: {
        currency: selectedRoom.price.currency,
        nightlyRate: selectedRoom.price.nightlyRate,
        numberOfNights: numberOfNights,
        subtotal: selectedRoom.price.nightlyRate * numberOfNights,
        taxes: selectedRoom.price.taxes * numberOfNights,
        fees: selectedRoom.price.fees * numberOfNights,
        totalPrice: selectedRoom.price.amount * numberOfNights,
      },
      status: "pending" as const,
    };

    addHotel(hotelBooking);
    router.push("/cart");
  };

  if (isLoading) return <LoadingScreen />;
  if (error || !hotel) return <ErrorPage message={error || "Hotel not found"} />;

  const selectedRoom = selectedRoomId
    ? hotel.rooms.find((r) => r.roomId === selectedRoomId)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hotel Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {hotel.location.address}, {hotel.location.city}, {hotel.location.country}
              </span>
            </div>
            {hotel.reviews && (
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">{hotel.reviews.rating.toFixed(1)}/5</span>
                <span className="mx-2">•</span>
                <span>{hotel.reviews.count} reviews</span>
              </div>
            )}
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{hotel.rating}</div>
            <div className="text-xs text-gray-600">{hotel.rating} Stars</div>
          </div>
        </div>

        {/* Hotel Images */}
        {hotel.images && hotel.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
            <div className="md:col-span-2 relative h-80">
              <Image
                src={hotel.images[0].url}
                alt={hotel.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-rows-2 gap-2">
              {hotel.images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative h-40">
                  <Image
                    src={img.url}
                    alt={`${hotel.name} - ${idx + 2}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Available Rooms */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
            <div className="space-y-4">
              {hotel.rooms.map((room) => (
                <div
                  key={room.roomId}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedRoomId === room.roomId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedRoomId(room.roomId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{room.name}</h3>
                      <p className="text-sm text-gray-600">{room.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {room.price.currency} {room.price.nightlyRate}
                      </div>
                      <div className="text-xs text-gray-500">per night</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>🛏️ {room.bedType}</span>
                    <span>•</span>
                    <span>
                      <Users className="w-4 h-4 inline mr-1" />
                      Max {room.maxOccupancy}
                    </span>
                    {room.size && (
                      <>
                        <span>•</span>
                        <span>{room.size}m²</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Guest Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Guest Information</h2>
            {guests.map((guest, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <h3 className="font-medium mb-3">
                  Guest {index + 1} {guest.isMainGuest && "(Main Guest)"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={guest.firstName}
                    onChange={(e) => {
                      const updated = [...guests];
                      updated[index].firstName = e.target.value;
                      setGuests(updated);
                    }}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={guest.lastName}
                    onChange={(e) => {
                      const updated = [...guests];
                      updated[index].lastName = e.target.value;
                      setGuests(updated);
                    }}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={guest.email}
                    onChange={(e) => {
                      const updated = [...guests];
                      updated[index].email = e.target.value;
                      setGuests(updated);
                    }}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={guest.phone || ""}
                    onChange={(e) => {
                      const updated = [...guests];
                      updated[index].phone = e.target.value;
                      setGuests(updated);
                    }}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            ))}
            {guests.length < 4 && (
              <Button
                variant="outline"
                onClick={() =>
                  setGuests([
                    ...guests,
                    {
                      id: (guests.length + 1).toString(),
                      firstName: "",
                      lastName: "",
                      email: "",
                      isMainGuest: false,
                    },
                  ])
                }
              >
                + Add Guest
              </Button>
            )}
          </Card>
        </div>

        {/* Booking Summary Sidebar */}
        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            {checkInDate && checkOutDate && (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{checkInDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{checkOutDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{numberOfNights}</span>
                </div>
              </div>
            )}

            {selectedRoom && (
              <>
                <div className="border-t pt-4 mb-4">
                  <div className="font-medium mb-2">{selectedRoom.name}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {selectedRoom.price.currency} {selectedRoom.price.nightlyRate} × {numberOfNights} nights
                      </span>
                      <span>
                        {selectedRoom.price.currency}{" "}
                        {(selectedRoom.price.nightlyRate * numberOfNights).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span>
                        {selectedRoom.price.currency}{" "}
                        {((selectedRoom.price.taxes + selectedRoom.price.fees) * numberOfNights).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedRoom.price.currency}{" "}
                        {(selectedRoom.price.amount * numberOfNights).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Includes taxes and fees
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={!selectedRoomId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to Cart
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
