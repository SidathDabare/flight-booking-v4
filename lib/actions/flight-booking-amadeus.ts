import amadeusToken from "../amadeusToken";

type FlightOffer = any; // TODO: Replace with proper type when available

interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  passportNumber: string;
}

export async function createBookingAmadeus(
  flight: FlightOffer,
  passengerDetails: PassengerDetails
) {
  try {
    // 1. Verify flight availability
    const flightVerification =
      await amadeusToken.shopping.flightOffers.pricing.post({
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flight],
        },
      });

    if (!flightVerification.data) {
      throw new Error("Flight is no longer available");
    }

    // 2. Create flight order
    const order = await amadeusToken.booking.flightOrders.post({
      data: {
        type: "flight-order",
        flightOffers: [flight],
        travelers: [
          {
            id: "1",
            dateOfBirth: passengerDetails.dateOfBirth,
            gender: passengerDetails.gender,
            name: {
              firstName: passengerDetails.firstName,
              lastName: passengerDetails.lastName,
            },
            contact: {
              emailAddress: passengerDetails.email,
              phones: [
                {
                  deviceType: "MOBILE",
                  countryCallingCode: "1",
                  number: passengerDetails.phoneNumber,
                },
              ],
            },
            documents: [
              {
                documentType: "PASSPORT",
                number: passengerDetails.passportNumber,
                expiryDate: "2025-04-14", // TODO: Add to form
                issuanceCountry: "US", // TODO: Add to form
                nationality: "US", // TODO: Add to form
                holder: true,
              },
            ],
          },
        ],
      },
    });

    return { success: true, data: order.data };
  } catch (error) {
    console.error("Booking error:", error);

    // Type guard for error with description property
    const errorMessage =
      (error && typeof error === 'object' && 'description' in error &&
       Array.isArray(error.description) && error.description[0]?.detail) ||
      (error instanceof Error && error.message) ||
      "Failed to create booking";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
