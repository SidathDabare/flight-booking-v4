import Amadeus, { ResponseError } from "amadeus-ts";

// Validate environment variables
if (!process.env.AMADEUS_CLIENT_ID) {
  throw new Error("AMADEUS_CLIENT_ID environment variable is required");
}

if (!process.env.AMADEUS_CLIENT_SECRET) {
  throw new Error("AMADEUS_CLIENT_SECRET environment variable is required");
}

const amadeusToken = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  hostname: "test", // Use "test" for sandbox environment,
});

// console.log(
//   "Amadeus client initialized with client ID:",
//   process.env.AMADEUS_CLIENT_ID
// );

export default amadeusToken;
