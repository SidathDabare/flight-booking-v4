"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/loading-screen";
import ErrorPage from "@/components/error-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Vehicle, Driver, InsuranceOption, AdditionalService } from "@/types/car";
import useCarStore from "@/lib/store/use-car-store";
import useBookingCartStore from "@/lib/store/use-booking-cart-store";
import { Users, Briefcase, Fuel, Settings, CheckCircle, Shield, Calendar } from "lucide-react";
import Image from "next/image";

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.carId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver>({
    id: "1",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    age: 25,
    licenseNumber: "",
    licenseIssuingCountry: "",
    licenseExpiryDate: "",
  });
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedVehicle, pickupDate, dropoffDate, durationDays } = useCarStore();
  const { addCar } = useBookingCartStore();

  // Mock insurance options
  const insuranceOptions: InsuranceOption[] = [
    {
      code: "CDW",
      name: "Collision Damage Waiver",
      description: "Reduces your liability for damage to the rental vehicle",
      coverage: "Up to $5,000",
      price: { amount: 15, currency: "USD", per: "DAY" },
      mandatory: false,
    },
    {
      code: "TP",
      name: "Theft Protection",
      description: "Protection against theft of the vehicle",
      coverage: "Full coverage",
      price: { amount: 10, currency: "USD", per: "DAY" },
      mandatory: false,
    },
    {
      code: "PAI",
      name: "Personal Accident Insurance",
      description: "Covers medical expenses for driver and passengers",
      coverage: "Up to $100,000",
      price: { amount: 8, currency: "USD", per: "DAY" },
      mandatory: false,
    },
  ];

  // Mock additional services
  const additionalServices: AdditionalService[] = [
    {
      code: "GPS",
      name: "GPS Navigation",
      description: "In-car GPS navigation system",
      price: { amount: 10, currency: "USD", per: "DAY" },
      available: true,
    },
    {
      code: "CHILD_SEAT",
      name: "Child Safety Seat",
      description: "Child car seat (specify age at pickup)",
      price: { amount: 15, currency: "USD", per: "RENTAL" },
      available: true,
    },
    {
      code: "WIFI",
      name: "Mobile WiFi Hotspot",
      description: "Portable WiFi device",
      price: { amount: 8, currency: "USD", per: "DAY" },
      available: true,
    },
  ];

  useEffect(() => {
    if (selectedVehicle && selectedVehicle.vehicleId === carId) {
      setVehicle(selectedVehicle);
      setIsLoading(false);
    } else {
      setError("Vehicle not found. Please search again.");
      setIsLoading(false);
    }
  }, [carId, selectedVehicle]);

  const calculateTotal = () => {
    if (!vehicle) return 0;

    let total = vehicle.price.amount;

    // Add insurance costs
    selectedInsurance.forEach((code) => {
      const insurance = insuranceOptions.find((i) => i.code === code);
      if (insurance) {
        total += insurance.price.amount * (insurance.price.per === "DAY" ? durationDays : 1);
      }
    });

    // Add service costs
    selectedServices.forEach((code) => {
      const service = additionalServices.find((s) => s.code === code);
      if (service) {
        total += service.price.amount * (service.price.per === "DAY" ? durationDays : 1);
      }
    });

    return total;
  };

  const handleAddToCart = () => {
    if (!vehicle || !pickupDate || !dropoffDate) {
      alert("Missing rental information. Please search again.");
      return;
    }

    // Validate driver information
    if (
      !driver.firstName ||
      !driver.lastName ||
      !driver.email ||
      !driver.licenseNumber ||
      !driver.licenseExpiryDate
    ) {
      alert("Please complete all required driver information");
      return;
    }

    // Validate insurance (at least one required)
    if (selectedInsurance.length === 0) {
      alert("Please select at least one insurance option");
      return;
    }

    // Create rental object
    const carRental = {
      rentalId: `rental-${Date.now()}`,
      vehicleId: vehicle.vehicleId,
      vehicle: {
        make: vehicle.specifications.make,
        model: vehicle.specifications.model,
        category: vehicle.specifications.category,
        transmission: vehicle.specifications.transmission,
        seating: vehicle.specifications.seating,
        image: vehicle.images?.[0],
      },
      vendor: {
        code: vehicle.vendor.code,
        name: vehicle.vendor.name,
        logo: vehicle.vendor.logo,
      },
      rental: {
        pickupLocation: useCarStore.getState().pickupLocation!,
        dropoffLocation: useCarStore.getState().dropoffLocation!,
        pickupDate: pickupDate,
        dropoffDate: dropoffDate,
        durationDays: durationDays,
        durationHours: durationDays * 24,
        isOneWay: false, // Calculate from locations
      },
      driver: driver,
      additionalDrivers: [],
      insurance: selectedInsurance.map((code) => {
        const ins = insuranceOptions.find((i) => i.code === code)!;
        return ins;
      }),
      additionalServices: selectedServices.map((code) => {
        const srv = additionalServices.find((s) => s.code === code)!;
        return srv;
      }),
      pricing: {
        currency: vehicle.price.currency,
        dailyRate: vehicle.price.dailyRate,
        numberOfDays: durationDays,
        subtotal: vehicle.price.amount,
        insurance: selectedInsurance.map((code) => {
          const ins = insuranceOptions.find((i) => i.code === code)!;
          return {
            name: ins.name,
            amount: ins.price.amount * (ins.price.per === "DAY" ? durationDays : 1),
          };
        }),
        additionalServices: selectedServices.map((code) => {
          const srv = additionalServices.find((s) => s.code === code)!;
          return {
            name: srv.name,
            amount: srv.price.amount * (srv.price.per === "DAY" ? durationDays : 1),
          };
        }),
        taxes: vehicle.price.taxes,
        fees: vehicle.price.fees,
        totalPrice: calculateTotal(),
      },
      status: "pending" as const,
    };

    addCar(carRental);
    router.push("/cart");
  };

  if (isLoading) return <LoadingScreen />;
  if (error || !vehicle) return <ErrorPage message={error || "Vehicle not found"} />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Vehicle Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {vehicle.specifications.make} {vehicle.specifications.model}
            </h1>
            <div className="flex items-center text-gray-600 mb-2">
              <span className="font-medium">{vehicle.vendor.name}</span>
              {vehicle.vendor.rating && (
                <>
                  <span className="mx-2">•</span>
                  <span>{vehicle.vendor.rating}/5 ⭐</span>
                </>
              )}
            </div>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-600">Category</div>
            <div className="text-lg font-bold text-blue-600">
              {vehicle.specifications.category}
            </div>
          </div>
        </div>

        {/* Vehicle Image */}
        {vehicle.images && vehicle.images.length > 0 && (
          <div className="relative h-96 mb-6">
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.specifications.make} ${vehicle.specifications.model}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Specifications */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Vehicle Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Seats</div>
                  <div className="font-medium">{vehicle.specifications.seating}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Luggage</div>
                  <div className="font-medium">
                    {vehicle.specifications.luggage.large}L + {vehicle.specifications.luggage.small}S
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Transmission</div>
                  <div className="font-medium">{vehicle.specifications.transmission}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Fuel className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">Fuel</div>
                  <div className="font-medium">{vehicle.specifications.fuelType}</div>
                </div>
              </div>
            </div>

            {vehicle.specifications.features && vehicle.specifications.features.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.specifications.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Driver Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Driver Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={driver.firstName}
                  onChange={(e) => setDriver({ ...driver, firstName: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={driver.lastName}
                  onChange={(e) => setDriver({ ...driver, lastName: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={driver.email}
                  onChange={(e) => setDriver({ ...driver, email: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={driver.phone}
                  onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="date"
                  placeholder="Date of Birth *"
                  value={driver.dateOfBirth}
                  onChange={(e) => {
                    const dob = new Date(e.target.value);
                    const age = Math.floor(
                      (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                    );
                    setDriver({ ...driver, dateOfBirth: e.target.value, age });
                  }}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={driver.age}
                  readOnly
                  className="px-3 py-2 border rounded-md bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="License Number *"
                  value={driver.licenseNumber}
                  onChange={(e) => setDriver({ ...driver, licenseNumber: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Issuing Country *"
                  value={driver.licenseIssuingCountry}
                  onChange={(e) =>
                    setDriver({ ...driver, licenseIssuingCountry: e.target.value })
                  }
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="date"
                  placeholder="License Expiry Date *"
                  value={driver.licenseExpiryDate}
                  onChange={(e) =>
                    setDriver({ ...driver, licenseExpiryDate: e.target.value })
                  }
                  className="px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Insurance Options */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Insurance & Protection
            </h2>
            <div className="space-y-4">
              {insuranceOptions.map((insurance) => (
                <div
                  key={insurance.code}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedInsurance.includes(insurance.code)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => {
                    if (selectedInsurance.includes(insurance.code)) {
                      setSelectedInsurance(selectedInsurance.filter((c) => c !== insurance.code));
                    } else {
                      setSelectedInsurance([...selectedInsurance, insurance.code]);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold">{insurance.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{insurance.description}</p>
                      <p className="text-xs text-gray-500">Coverage: {insurance.coverage}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-blue-600">
                        +{insurance.price.currency} {insurance.price.amount}
                      </div>
                      <div className="text-xs text-gray-500">per {insurance.price.per.toLowerCase()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Additional Services */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Additional Services</h2>
            <div className="space-y-4">
              {additionalServices.map((service) => (
                <div
                  key={service.code}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedServices.includes(service.code)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => {
                    if (selectedServices.includes(service.code)) {
                      setSelectedServices(selectedServices.filter((c) => c !== service.code));
                    } else {
                      setSelectedServices([...selectedServices, service.code]);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-blue-600">
                        +{service.price.currency} {service.price.amount}
                      </div>
                      <div className="text-xs text-gray-500">per {service.price.per.toLowerCase()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Booking Summary Sidebar */}
        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Rental Summary</h2>
            {pickupDate && dropoffDate && (
              <div className="space-y-3 mb-6">
                <div className="flex items-start text-sm">
                  <Calendar className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-gray-600">Pickup</div>
                    <div className="font-medium">{pickupDate}</div>
                  </div>
                </div>
                <div className="flex items-start text-sm">
                  <Calendar className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-gray-600">Drop-off</div>
                    <div className="font-medium">{dropoffDate}</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{durationDays} days</span>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle rental</span>
                  <span>
                    {vehicle.price.currency} {vehicle.price.amount.toFixed(2)}
                  </span>
                </div>
                {selectedInsurance.map((code) => {
                  const insurance = insuranceOptions.find((i) => i.code === code)!;
                  const cost =
                    insurance.price.amount *
                    (insurance.price.per === "DAY" ? durationDays : 1);
                  return (
                    <div key={code} className="flex justify-between">
                      <span className="text-gray-600">{insurance.name}</span>
                      <span>
                        {insurance.price.currency} {cost.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {selectedServices.map((code) => {
                  const service = additionalServices.find((s) => s.code === code)!;
                  const cost =
                    service.price.amount * (service.price.per === "DAY" ? durationDays : 1);
                  return (
                    <div key={code} className="flex justify-between">
                      <span className="text-gray-600">{service.name}</span>
                      <span>
                        {service.price.currency} {cost.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {vehicle.price.taxes > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span>
                      {vehicle.price.currency} {vehicle.price.taxes.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {vehicle.price.currency} {calculateTotal().toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">All inclusive</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={selectedInsurance.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to Cart
            </Button>
            {selectedInsurance.length === 0 && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Please select at least one insurance option
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
