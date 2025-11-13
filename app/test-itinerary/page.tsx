export default function TestItineraryPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Test Itinerary Page</h1>
        <p className="text-center">This page is under development.</p>
      </div>
    </div>
  );
}

// import FlightItinerary from "@/components/flight-itinerary";

// const mockFlightData = {
//   departure: {
//     duration: "PT8H30M",
//     segments: [
//       {
//         departure: {
//           at: "2024-03-15T10:00:00",
//           iataCode: "JFK",
//           terminal: "4"
//         },
//         arrival: {
//           at: "2024-03-15T14:30:00",
//           iataCode: "LHR",
//           terminal: "2"
//         },
//         carrierCode: "BA",
//         number: "117",
//         duration: "PT7H30M",
//         numberOfStops: 0
//       },
//       {
//         departure: {
//           at: "2024-03-15T16:00:00",
//           iataCode: "LHR",
//           terminal: "2"
//         },
//         arrival: {
//           at: "2024-03-15T18:00:00",
//           iataCode: "CDG",
//           terminal: "1"
//         },
//         carrierCode: "AF",
//         number: "1234",
//         duration: "PT1H00M",
//         numberOfStops: 0
//       }
//     ]
//   },
//   returnFlight: {
//     duration: "PT6H45M",
//     segments: [
//       {
//         departure: {
//           at: "2024-03-22T15:30:00",
//           iataCode: "CDG",
//           terminal: "1"
//         },
//         arrival: {
//           at: "2024-03-22T18:15:00",
//           iataCode: "JFK",
//           terminal: "4"
//         },
//         carrierCode: "AF",
//         number: "5678",
//         duration: "PT6H45M",
//         numberOfStops: 0
//       }
//     ]
//   }
// };

// export default function TestItineraryPage() {
//   return (
//     <div className="min-h-screen bg-gray-100 py-8">
//       <div className="container mx-auto px-4">
//         <h1 className="text-2xl font-bold mb-8 text-center">Flight Itinerary Component Test</h1>

//         <div className="space-y-8">
//           <div>
//             <h2 className="text-lg font-semibold mb-4">Round Trip Flight</h2>
//             <FlightItinerary
//               departure={mockFlightData.departure}
//               returnFlight={mockFlightData.returnFlight}
//               baggageInfo="Hand luggage included"
//             />
//           </div>

//           <div>
//             <h2 className="text-lg font-semibold mb-4">One Way Flight</h2>
//             <FlightItinerary
//               departure={mockFlightData.departure}
//               baggageInfo="Hand luggage included"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
