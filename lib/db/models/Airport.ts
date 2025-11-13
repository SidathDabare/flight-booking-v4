import mongoose, { Document, Schema } from "mongoose";

export interface IAirport extends Document {
  name: string;
  city: string;
  country: string;
  IATA: string;
  ICAO: string;
  lat: string;
  lon: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const AirportSchema = new Schema<IAirport>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    IATA: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      trim: true,
    },
    ICAO: {
      type: String,
      required: true,
      unique: false,
      uppercase: true,
      minlength: 4,
      maxlength: 4,
      trim: true,
    },
    lat: {
      type: String,
      required: true,
    },
    lon: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster searching
AirportSchema.index({ name: "text", city: "text", country: "text" });
AirportSchema.index({ city: 1 });
AirportSchema.index({ country: 1 });

export const Airport =
  mongoose.models.Airport || mongoose.model<IAirport>("Airport", AirportSchema);
