import puppeteer from "puppeteer";
import { Resend } from "resend";
import Order from "@/lib/db/models/Order";
import connectDB from "@/lib/db/mongoose";

const resend = new Resend(process.env.RESEND_API_KEY);

// Amadeus API types for flight data
interface FlightSegment {
  carrierCode: string;
  number: string;
  departure: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  duration: string;
  co2Emissions?: Array<{
    cabin: string;
    weight?: number;
    weightUnit?: string;
  }>;
  operating?: {
    carrierCode: string;
  };
  [key: string]: unknown;
}

interface FlightItinerary {
  segments: FlightSegment[];
  duration: string;
  [key: string]: unknown;
}

interface Traveler {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender?: string;
  contact?: {
    emailAddress?: string;
    phones?: Array<{ number: string }>;
  };
  documents?: Array<{
    documentType: string;
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    nationality: string;
  }>;
  [key: string]: unknown;
}

interface TravelerPricing {
  travelerId: string;
  travelerType: string;
  fareDetailsBySegment?: Array<{
    brandedFare?: string;
  }>;
  [key: string]: unknown;
}

export async function generateTicketPDF(orderId: string): Promise<Buffer> {
  //console.log(`🔄 Starting PDF generation for order: ${orderId}`);

  await connectDB();

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    //console.error(`❌ Order not found for PDF generation: ${orderId}`);
    throw new Error(`Order not found: ${orderId}`);
  }

  //console.log("✅ Order found for PDF generation:", orderId);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .ticket-header {
              border-bottom: 1px solid #ccc;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .passenger-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .passenger-name {
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .issue-info {
              text-align: right;
            }
            .travel-info-header {
              background-color: #f0f0f0;
              padding: 10px 15px;
              margin: 20px 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .travel-info-header h2 {
              margin: 0;
              font-size: 16px;
            }
            .leg-header {
              background-color: #f0f0f0;
              padding: 10px 15px;
              margin-bottom: 15px;
              font-weight: bold;
            }
            .flight-leg {
              margin-bottom: 30px;
              border: 1px solid #eee;
              padding: 0;
            }
            .flight-header {
              display: grid;
              grid-template-columns: 120px 1fr 120px;
              padding: 15px;
              border-bottom: 1px solid #eee;
            }
            .flight-details {
              padding: 15px;
              display: grid;
              grid-template-columns: 120px 1fr;
              gap: 15px;
            }
            .flight-number {
              font-weight: bold;
              font-size: 16px;
            }
            .flight-class {
              color: #666;
              font-size: 14px;
            }
            .airport-info {
              display: flex;
              align-items: flex-start;
              gap: 20px;
            }
            .time {
              font-size: 16px;
              font-weight: bold;
              white-space: nowrap;
            }
            .airport {
              font-size: 16px;
              font-weight: bold;
            }
            .airport-name {
              font-size: 14px;
              color: #666;
            }
            .terminal {
              color: #666;
              font-size: 14px;
            }
            .baggage-info {
              background-color: #f9f9f9;
              padding: 10px 15px;
              font-size: 14px;
              border-top: 1px solid #eee;
            }
            .coupon-validity {
              color: #666;
              font-size: 12px;
              margin-top: 10px;
              font-style: italic;
            }
            .label {
              color: #666;
              font-size: 14px;
            }
            .operating-carrier {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .co2-info {
              color: #2E7D32;
              font-size: 13px;
              padding: 5px 15px;
              border-top: 1px solid #eee;
              background-color: #F1F8E9;
            }
            .travelers-section {
              margin-top: 30px;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }
            .traveler-card {
              background: #f9f9f9;
              border: 1px solid #eee;
              padding: 15px;
              margin-bottom: 15px;
            }
            .traveler-type {
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .taxes-details {
              font-size: 13px;
              color: #666;
              margin-top: 5px;
            }
            .city-name {
              color: #666;
              font-size: 13px;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="ticket-header">
            <div class="passenger-info">
              <div>
                <div class="label">Booking Reference</div>
                <div class="passenger-name">${
                  order.data.associatedRecords?.[0]?.reference || order.metadata?.amadeusBookingId || "N/A"
                }</div>
              </div>
              <div class="issue-info">
                <div class="label">Creation Date</div>
                <div>${new Date(
                  order.data.associatedRecords?.[0]?.creationDate || order.createdAt
                ).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="travel-info-header">
            <h2>Flight Itinerary</h2>
            <div style="font-size: 12px;">All times shown are local for each city</div>
          </div>

          ${order.data.flightOffers[0].itineraries
            .map(
              (itinerary: FlightItinerary, legIndex: number) => `
            <div class="leg-header">
              ${legIndex === 0 ? "Outbound" : "Return"} Flight (${
                legIndex + 1
              } of ${order.data.flightOffers[0].itineraries.length})
            </div>
            ${itinerary.segments
              .map(
                (segment: FlightSegment, index: number) => `
              <div class="flight-leg">
                <div class="flight-header">
                  <div>
                    <div class="flight-number">Flight ${segment.carrierCode}${
                  segment.number
                }</div>
                    <div class="flight-class">${
                      segment.co2Emissions?.[0]?.cabin || "Economy"
                    } ${
                  order.data.flightOffers[0].travelerPricings?.[0]
                    ?.fareDetailsBySegment?.[0]?.brandedFare || ""
                }</div>
                    ${
                      segment.operating?.carrierCode
                        ? `<div class="operating-carrier">Operated by ${segment.operating.carrierCode}</div>`
                        : ""
                    }
                  </div>
                  <div></div>
                  <div style="text-align: right;">
                    <div class="label">Duration</div>
                    <div class="time">${segment.duration
                      .replace("PT", "")
                      .replace("H", "h ")
                      .replace("M", "m")}</div>
                  </div>
                </div>

                <div class="flight-details">
                  <div class="label">Departure</div>
                  <div class="airport-info">
                    <div class="time">${new Date(
                      segment.departure.at
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}</div>
                    <div>
                      <div class="airport">${segment.departure.iataCode}</div>
                      ${
                        order.dictionaries?.locations?.[
                          segment.departure.iataCode
                        ]
                          ? `<div class="city-name">${
                              order.dictionaries.locations[
                                segment.departure.iataCode
                              ].cityCode
                            }, ${
                              order.dictionaries.locations[
                                segment.departure.iataCode
                              ].countryCode
                            }</div>`
                          : ""
                      }
                      ${
                        segment.departure.terminal
                          ? `<div class="terminal">Terminal ${segment.departure.terminal}</div>`
                          : ""
                      }
                    </div>
                  </div>

                  <div class="label">Arrival</div>
                  <div class="airport-info">
                    <div class="time">${new Date(
                      segment.arrival.at
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}</div>
                    <div>
                      <div class="airport">${segment.arrival.iataCode}</div>
                      ${
                        order.dictionaries?.locations?.[
                          segment.arrival.iataCode
                        ]
                          ? `<div class="city-name">${
                              order.dictionaries.locations[
                                segment.arrival.iataCode
                              ].cityCode
                            }, ${
                              order.dictionaries.locations[
                                segment.arrival.iataCode
                              ].countryCode
                            }</div>`
                          : ""
                      }
                      ${
                        segment.arrival.terminal
                          ? `<div class="terminal">Terminal ${segment.arrival.terminal}</div>`
                          : ""
                      }
                    </div>
                  </div>
                </div>

                <div class="baggage-info">
                  <span class="label">Checked Baggage:</span> 
                  ${
                    order.data.flightOffers[0].travelerPricings?.[0]
                      ?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0
                  } piece(s)
                </div>

                <div class="co2-info">
                  <span class="label">CO2 Emissions:</span> 
                  ${segment.co2Emissions?.[0]?.weight || "N/A"} ${
                  segment.co2Emissions?.[0]?.weightUnit || ""
                }
                </div>
              </div>
            `
              )
              .join("")}
          `
            )
            .join("")}

          <div class="travelers-section">
            <h3>Travelers Information</h3>
            ${order.data.travelers
              .map(
                (traveler: Traveler) => `
              <div class="traveler-card">
                <div class="traveler-type">${
                  order.data.flightOffers[0].travelerPricings.find(
                    (tp: TravelerPricing) => tp.travelerId === traveler.id
                  ).travelerType
                }</div>
                <div class="passenger-name">${traveler.name.lastName}/${
                  traveler.name.firstName
                }</div>
                <div style="font-size: 14px; margin-top: 5px;">
                  <div>Date of Birth: ${new Date(
                    traveler.dateOfBirth
                  ).toLocaleDateString()}</div>
                  ${
                    traveler.documents && traveler.documents.length > 0
                      ? `<div>Passport: ${traveler.documents[0].number}</div>
                         <div>Nationality: ${traveler.documents[0].nationality}</div>`
                      : ""
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>

          <div style="margin-top: 30px;">
            <h3>Fare Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="text-align: left; padding: 8px 0;">Base fare</th>
                <td>${order.data.flightOffers[0].price.base} ${
      order.data.flightOffers[0].price.currency
    }</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 8px 0;">Total fare (including taxes)</th>
                <td>${order.data.flightOffers[0].price.grandTotal} ${
      order.data.flightOffers[0].price.currency
    }</td>
              </tr>
            </table>
            <div class="taxes-details">
              Refundable taxes: ${
                order.data.flightOffers[0].travelerPricings?.[0]?.price
                  ?.refundableTaxes || "0"
              } ${order.data.flightOffers[0].price.currency}
            </div>
          </div>

          <div style="margin-top: 30px;">
            <h3>Additional Information</h3>
            <div style="font-size: 14px; margin-top: 10px;">
              <p><strong>Cabin Baggage Allowance:</strong><br>
              One piece of carry-on baggage per passenger</p>
              ${order.data.contacts?.[0] ? `
              <p><strong>Contact Information:</strong><br>
              ${order.data.contacts[0].companyName || "N/A"}<br>
              ${order.data.contacts[0].emailAddress || order.metadata?.customerEmail || "N/A"}<br>
              ${order.data.contacts[0].phones?.[0] ? `Phone: +${
                order.data.contacts[0].phones[0].countryCallingCode
              } ${order.data.contacts[0].phones[0].number}` : ""}</p>
              ` : `
              <p><strong>Contact Information:</strong><br>
              ${order.metadata?.customerName || "N/A"}<br>
              ${order.metadata?.customerEmail || "N/A"}</p>
              `}
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function sendTicketEmail(
  customerEmail: string, 
  customerName: string, 
  orderId: string, 
  pdfBuffer: Buffer
): Promise<void> {
  try {
    //console.log(`🔄 Starting email send for order: ${orderId}`);
    //console.log(`📧 Sending to: ${customerEmail}`);
    //console.log(`👤 Customer name: ${customerName}`);
    //console.log(`📎 PDF size: ${pdfBuffer.length} bytes`);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: customerEmail,
      subject: "Your Flight Ticket - Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Thank you for your booking, ${customerName}!</h2>
          <p>Your flight has been successfully booked. Please find your ticket attached to this email.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Important Information:</h3>
            <ul style="color: #666;">
              <li>Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights</li>
              <li>Ensure your passport is valid for at least 6 months from your travel date</li>
              <li>Check-in online to save time at the airport</li>
              <li>Review baggage allowances and restrictions</li>
            </ul>
          </div>
          
          <p>Your ticket is attached as a PDF file. You can print it or save it on your mobile device for easy access at the airport.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">Have a wonderful trip!</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p>If you have any questions about your booking, please contact our customer support.</p>
            <p>Best regards,<br>Flight Booking Team</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `flight-ticket-${orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    //console.log(`✅ Email sent successfully to: ${customerEmail}`);
  } catch (error) {
    //console.error("❌ Error sending ticket email:", error);
    throw new Error(`Failed to send ticket email: ${error}`);
  }
}

export async function generateAndSendTicket(orderId: string): Promise<void> {
  try {
    //console.log(`🔄 Starting ticket generation for order: ${orderId}`);

    await connectDB();
    //console.log("✅ Database connected");

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      //console.error(`❌ Order not found: ${orderId}`);
      throw new Error(`Order not found: ${orderId}`);
    }

    //console.log("✅ Order found:", orderId);
    //console.log("📧 Customer email:", order.metadata?.customerEmail);
    //console.log("👤 Customer name:", order.metadata?.customerName);

    if (!order.metadata?.customerEmail || !order.metadata?.customerName) {
      //console.error(`❌ Missing customer data in order: ${orderId}`);
      //console.log("Order metadata:", JSON.stringify(order.metadata, null, 2));
      throw new Error(`Customer email or name not found in order: ${orderId}`);
    }

    //console.log("🔄 Generating PDF...");
    const pdfBuffer = await generateTicketPDF(orderId);
    //console.log("✅ PDF generated successfully, size:", pdfBuffer.length, "bytes");

    //console.log("🔄 Sending email...");
    await sendTicketEmail(
      order.metadata.customerEmail,
      order.metadata.customerName,
      orderId,
      pdfBuffer
    );
    //console.log("✅ Email sent successfully");

    //console.log("🔄 Updating order...");
    await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          ticketSent: true,
          ticketSentAt: new Date()
        }
      }
    );
    //console.log("✅ Order updated successfully");

    //console.log(`✅ Ticket successfully generated and sent for order: ${orderId}`);
  } catch (error) {
    //console.error(`❌ Error generating and sending ticket for order ${orderId}:`, error);
    throw error;
  }
}