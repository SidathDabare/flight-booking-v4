import mongoose, { Document, Schema } from "mongoose";

export interface IOffer extends Document {
  title: string;
  departureCity: string;
  arrivalCity: string;
  description: string;
  publishedDate: Date;
  price: number;
  discount: number;
  expireDate: Date;
  isHidden: boolean;
  imageUrl?: string;
  imagePublicId?: string;
  responsiveImages?: {
    desktop: {
      url: string;
      width: number;
      height: number;
    };
    tablet: {
      url: string;
      width: number;
      height: number;
    };
    mobile: {
      url: string;
      width: number;
      height: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    departureCity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    arrivalCity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    publishedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    responsiveImages: {
      type: {
        desktop: {
          url: { type: String, required: true },
          width: { type: Number, required: true },
          height: { type: Number, required: true },
        },
        tablet: {
          url: { type: String, required: true },
          width: { type: Number, required: true },
          height: { type: Number, required: true },
        },
        mobile: {
          url: { type: String, required: true },
          width: { type: Number, required: true },
          height: { type: Number, required: true },
        },
      },
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

OfferSchema.index({ expireDate: 1 });
OfferSchema.index({ publishedDate: -1 });
OfferSchema.index({ isHidden: 1, expireDate: 1 });

export const Offer = mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);