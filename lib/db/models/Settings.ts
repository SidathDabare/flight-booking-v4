import mongoose, { Document, Schema } from "mongoose";

export interface ICarouselItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imagePublicId: string;
  isHidden: boolean;
  order: number;
  responsiveImages: {
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

export interface ISettings extends Document {
  carousel: {
    items: ICarouselItem[];
    isEnabled: boolean;
  };
  offers: {
    isEnabled: boolean;
  };
  languages: {
    enabledLocales: string[];
    defaultLocale: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CarouselItemSchema = new Schema<ICarouselItem>({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  subtitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  responsiveImages: {
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
}, {
  timestamps: true,
});

const SettingsSchema = new Schema<ISettings>({
  carousel: {
    items: [CarouselItemSchema],
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  offers: {
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  languages: {
    enabledLocales: {
      type: [String],
      default: ['en', 'it', 'si'],
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'At least one language must be enabled'
      }
    },
    defaultLocale: {
      type: String,
      default: 'en',
      validate: {
        validator: function(v: string) {
          return ['en', 'it', 'si'].includes(v);
        },
        message: 'Invalid default locale'
      }
    },
  },
}, {
  timestamps: true,
});

SettingsSchema.index({ "carousel.items.order": 1 });

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);