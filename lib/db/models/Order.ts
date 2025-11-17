import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    data: {
      type: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
      queuingOfficeId: {
        type: String,
        required: true,
      },
      associatedRecords: [
        {
          reference: {
            type: String,
          },
          creationDate: {
            type: Date,
          },
          originSystemCode: {
            type: String,
          },
          flightOfferId: {
            type: String,
          },
        },
      ],
      flightOffers: [
        {
          type: {
            type: String,
          },
          id: {
            type: String,
          },
          source: {
            type: String,
          },
          nonHomogeneous: {
            type: Boolean,
          },
          lastTicketingDate: {
            type: Date,
          },
          itineraries: [
            {
              segments: [
                {
                  departure: {
                    iataCode: {
                      type: String,
                    },
                    at: {
                      type: Date,
                    },
                  },
                  arrival: {
                    iataCode: {
                      type: String,
                    },
                    at: {
                      type: Date,
                    },
                  },
                  carrierCode: {
                    type: String,
                  },
                  number: {
                    type: String,
                  },
                  aircraft: {
                    code: {
                      type: String,
                    },
                  },
                  operating: {
                    carrierCode: {
                      type: String,
                    },
                  },
                  duration: {
                    type: String,
                  },
                  id: {
                    type: String,
                  },
                  numberOfStops: {
                    type: Number,
                  },
                  co2Emissions: [
                    {
                      weight: {
                        type: Number,
                      },
                      weightUnit: {
                        type: String,
                      },
                      cabin: {
                        type: String,
                      },
                    },
                  ],
                },
              ],
            },
          ],
          price: {
            currency: {
              type: String,
            },
            total: {
              type: String,
            },
            base: {
              type: String,
            },
            fees: [
              {
                amount: {
                  type: String,
                },
                type: {
                  type: String,
                },
              },
            ],
            grandTotal: {
              type: String,
            },
            billingCurrency: {
              type: String,
            },
          },
          pricingOptions: {
            fareType: [
              {
                type: String,
              },
            ],
            includedCheckedBagsOnly: {
              type: Boolean,
            },
          },
          validatingAirlineCodes: [
            {
              type: String,
            },
          ],
          travelerPricings: [
            {
              travelerId: {
                type: String,
              },
              fareOption: {
                type: String,
              },
              travelerType: {
                type: String,
              },
              associatedAdultId: {
                type: String,
              },
              price: {
                currency: {
                  type: String,
                },
                total: {
                  type: String,
                },
                base: {
                  type: String,
                },
                taxes: [
                  {
                    amount: {
                      type: String,
                    },
                    code: {
                      type: String,
                    },
                  },
                ],
                refundableTaxes: {
                  type: String,
                },
              },
              fareDetailsBySegment: [
                {
                  segmentId: {
                    type: String,
                  },
                  cabin: {
                    type: String,
                  },
                  fareBasis: {
                    type: String,
                  },
                  brandedFare: {
                    type: String,
                  },
                  class: {
                    type: String,
                  },
                  includedCheckedBags: {
                    quantity: {
                      type: Number,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
      travelers: [
        {
          id: {
            type: String,
          },
          dateOfBirth: {
            type: Date,
          },
          gender: {
            type: String,
          },
          name: {
            firstName: {
              type: String,
            },
            lastName: {
              type: String,
            },
          },
          documents: [
            {
              number: {
                type: String,
              },
              issuanceDate: {
                type: Date,
              },
              expiryDate: {
                type: Date,
              },
              issuanceCountry: {
                type: String,
              },
              issuanceLocation: {
                type: String,
              },
              nationality: {
                type: String,
              },
              birthPlace: {
                type: String,
              },
              documentType: {
                type: String,
              },
              holder: {
                type: Boolean,
              },
            },
          ],
          contact: {
            purpose: {
              type: String,
            },
            phones: [
              {
                deviceType: {
                  type: String,
                },
                countryCallingCode: {
                  type: String,
                },
                number: {
                  type: String,
                },
              },
            ],
            emailAddress: {
              type: String,
            },
          },
        },
      ],
      remarks: {
        general: [
          {
            subType: {
              type: String,
            },
            text: {
              type: String,
            },
          },
        ],
      },
      ticketingAgreement: {
        option: {
          type: String,
        },
        delay: {
          type: String,
        },
      },
      automatedProcess: [
        {
          code: {
            type: String,
          },
          queue: {
            number: {
              type: String,
            },
            category: {
              type: String,
            },
          },
          officeId: {
            type: String,
          },
        },
      ],
      contacts: [
        {
          addresseeName: {
            firstName: {
              type: String,
            },
          },
          address: {
            lines: [
              {
                type: String,
              },
            ],
            postalCode: {
              type: String,
            },
            countryCode: {
              type: String,
            },
            cityName: {
              type: String,
            },
          },
          purpose: {
            type: String,
          },
          phones: [
            {
              deviceType: {
                type: String,
              },
              countryCallingCode: {
                type: String,
              },
              number: {
                type: String,
              },
            },
          ],
          companyName: {
            type: String,
          },
          emailAddress: {
            type: String,
          },
        },
      ],
    },
    dictionaries: {
      locations: {
        type: Map,
        of: new mongoose.Schema(
          {
            cityCode: { type: String },
            countryCode: { type: String },
          },
          { _id: false }
        ), // Prevent _id field in the subdocument
      },
    },
    metadata: {
      amadeusBookingId: {
        type: String,
      },
      bookingDate: {
        type: String,
      },
      customerEmail: {
        type: String,
      },
      customerName: {
        type: String,
      },
      userId: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    stripe_payment_intent: {
      type: String,
      required: false,
    },
    ticketSent: {
      type: Boolean,
      default: false,
    },
    ticketSentAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;

// // Sub-schemas
// const co2EmissionsSchema = new mongoose.Schema({
//   weight: Number,
//   weightUnit: String,
//   cabin: String,
// });

// const segmentSchema = new mongoose.Schema({
//   departure: {
//     iataCode: String,
//     terminal: String,
//     at: Date,
//   },
//   arrival: {
//     iataCode: String,
//     terminal: String,
//     at: Date,
//   },
//   carrierCode: String,
//   number: String,
//   aircraft: {
//     code: String,
//   },
//   operating: {
//     carrierCode: String,
//   },
//   duration: String,
//   id: String,
//   numberOfStops: Number,
//   co2Emissions: [co2EmissionsSchema],
// });

// const itinerarySchema = new mongoose.Schema({
//   segments: [segmentSchema],
// });

// const taxSchema = new mongoose.Schema({
//   amount: String,
//   code: String,
// });

// const feeSchema = new mongoose.Schema({
//   amount: String,
//   type: String,
// });

// const priceSchema = new mongoose.Schema({
//   currency: String,
//   total: String,
//   base: String,
//   fees: [feeSchema],
//   grandTotal: String,
//   billingCurrency: String,
//   taxes: [taxSchema],
//   refundableTaxes: String,
// });

// const fareDetailsSchema = new mongoose.Schema({
//   segmentId: String,
//   cabin: String,
//   fareBasis: String,
//   brandedFare: String,
//   class: String,
//   includedCheckedBags: {
//     quantity: Number,
//   },
// });

// const travelerPricingSchema = new mongoose.Schema({
//   travelerId: String,
//   fareOption: String,
//   travelerType: String,
//   associatedAdultId: String,
//   price: priceSchema,
//   fareDetailsBySegment: [fareDetailsSchema],
// });

// const flightOfferSchema = new mongoose.Schema({
//   type: String,
//   id: String,
//   source: String,
//   nonHomogeneous: Boolean,
//   lastTicketingDate: Date,
//   itineraries: [itinerarySchema],
//   price: priceSchema,
//   pricingOptions: {
//     fareType: [String],
//     includedCheckedBagsOnly: Boolean,
//   },
//   validatingAirlineCodes: [String],
//   travelerPricings: [travelerPricingSchema],
// });

// const documentSchema = new mongoose.Schema({
//   number: String,
//   issuanceDate: Date,
//   expiryDate: Date,
//   issuanceCountry: String,
//   issuanceLocation: String,
//   nationality: String,
//   birthPlace: String,
//   documentType: String,
//   holder: Boolean,
// });

// const phoneSchema = new mongoose.Schema({
//   deviceType: String,
//   countryCallingCode: String,
//   number: String,
// });

// const contactSchema = new mongoose.Schema({
//   purpose: String,
//   phones: [phoneSchema],
//   emailAddress: String,
// });

// const travelerSchema = new mongoose.Schema({
//   id: String,
//   dateOfBirth: Date,
//   gender: String,
//   name: {
//     firstName: String,
//     lastName: String,
//   },
//   documents: [documentSchema],
//   contact: contactSchema,
// });

// const remarkSchema = new mongoose.Schema({
//   subType: String,
//   text: String,
// });

// const ticketingAgreementSchema = new mongoose.Schema({
//   option: String,
//   delay: String,
// });

// const automatedProcessSchema = new mongoose.Schema({
//   code: String,
//   queue: {
//     number: String,
//     category: String,
//   },
//   officeId: String,
// });

// const addressSchema = new mongoose.Schema({
//   lines: [String],
//   postalCode: String,
//   countryCode: String,
//   cityName: String,
// });

// const contactInfoSchema = new mongoose.Schema({
//   addresseeName: {
//     firstName: String,
//   },
//   address: addressSchema,
//   purpose: String,
//   phones: [phoneSchema],
//   companyName: String,
//   emailAddress: String,
// });

// const associatedRecordSchema = new mongoose.Schema({
//   reference: String,
//   creationDate: Date,
//   originSystemCode: String,
//   flightOfferId: String,
// });

// const locationSchema = new mongoose.Schema({
//   cityCode: String,
//   countryCode: String,
// });

// const dictionariesSchema = new mongoose.Schema({
//   locations: {
//     type: Map,
//     of: locationSchema,
//   },
// });

// const metadataSchema = new mongoose.Schema({
//   amadeusBookingId: String,
//   bookingDate: String,
//   customerEmail: String,
//   customerName: String,
//   userId: String,
// });

// // Main schema
// const orderSchema = new mongoose.Schema(
//   {
//     data: {
//       type: { type: String, required: true },
//       id: { type: String, required: true },
//       queuingOfficeId: String,
//       associatedRecords: [associatedRecordSchema],
//       flightOffers: [flightOfferSchema],
//       travelers: [travelerSchema],
//       remarks: {
//         general: [remarkSchema],
//       },
//       ticketingAgreement: ticketingAgreementSchema,
//       automatedProcess: [automatedProcessSchema],
//       contacts: [contactInfoSchema],
//     },
//     dictionaries: dictionariesSchema,
//     metadata: metadataSchema,
//     customer: {
//       type: String,
//       required: false,
//     },
//     stripe_payment_intent: {
//       type: String,
//       sparse: true,
//       required: false,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// export default Order;
