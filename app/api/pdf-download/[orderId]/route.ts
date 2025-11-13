// app/api/pdf-download/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import Order from "@/lib/db/models/Order";
import connectDB from "@/lib/db/mongoose";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) => {
  try {
    const { orderId } = await params;
    //console.log("PDF Download - Fetching order:", orderId);

    // Connect to database
    await connectDB();
    //console.log("PDF Download - Database connected");

    // Find the order
    const order = await Order.findOne({ _id: orderId });
    //console.log("PDF Download - Order found:", !!order);

    if (!order) {
      //console.error("PDF Download - Order not found:", orderId);
      return new NextResponse(JSON.stringify({ 
        error: "Order not found", 
        orderId: orderId 
      }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    //console.log("PDF Download - Order data structure:", {
    //  hasData: !!order.data,
    //  hasAssociatedRecords: !!order.data?.associatedRecords,
    //  hasFlightOffers: !!order.data?.flightOffers,
    //  hasTravelers: !!order.data?.travelers,
    //  hasContacts: !!order.data?.contacts
    //});

    // Validate order data structure before proceeding
    if (!order.data || !order.data.flightOffers || !order.data.travelers) {
      //console.error("PDF Download - Invalid order data structure");
      return new NextResponse(JSON.stringify({ 
        error: "Invalid order data structure",
        details: "Order is missing required flight or traveler data"
      }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    //console.log("PDF Download - Launching puppeteer browser");
    // Launch browser with proper options
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    //console.log("PDF Download - Browser launched successfully");

    try {
      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({ width: 1200, height: 800 });

      // Generate HTML content
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
                    order.data.associatedRecords?.[0]?.reference || 'N/A'
                  }</div>
                </div>
                <div class="issue-info">
                  <div class="label">Creation Date</div>
                  <div>${order.data.associatedRecords?.[0]?.creationDate ? 
                    new Date(order.data.associatedRecords[0].creationDate).toLocaleString() 
                    : 'N/A'
                  }</div>
                </div>
              </div>
            </div>

            <div class="travel-info-header">
              <h2>Flight Itinerary</h2>
              <div style="font-size: 12px;">All times shown are local for each city</div>
            </div>

            ${order.data.flightOffers[0].itineraries
              .map(
                (itinerary: any, legIndex: number) => `
              <div class="leg-header">
                ${legIndex === 0 ? "Outbound" : "Return"} Flight (${
                  legIndex + 1
                } of ${order.data.flightOffers[0].itineraries.length})
              </div>
              ${itinerary.segments
                .map(
                  (segment: any, index: number) => `
                <div class="flight-leg">
                  <div class="flight-header">
                    <div>
                      <div class="flight-number">Flight ${segment.carrierCode || 'N/A'}${
                    segment.number || ''
                  }</div>
                      <div class="flight-class">${
                        segment.co2Emissions?.[0]?.cabin || 'Economy'
                      } ${
                    order.data.flightOffers?.[0]?.travelerPricings?.[0]
                      ?.fareDetailsBySegment?.[0]?.brandedFare || 'Standard'
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
                      <div class="time">${(segment.duration || 'N/A')
                        .replace("PT", "")
                        .replace("H", "h ")
                        .replace("M", "m")}</div>
                    </div>
                  </div>

                  <div class="flight-details">
                    <div class="label">Departure</div>
                    <div class="airport-info">
                      <div class="time">${segment.departure?.at ? new Date(
                        segment.departure.at
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }) : 'N/A'}</div>
                      <div>
                        <div class="airport">${segment.departure?.iataCode || 'N/A'}</div>
                        ${
                          (segment.departure?.iataCode && order.dictionaries?.locations?.[
                            segment.departure.iataCode
                          ])
                            ? `<div class="city-name">${
                                order.dictionaries.locations[
                                  segment.departure.iataCode
                                ]?.cityCode || ''
                              }, ${
                                order.dictionaries.locations[
                                  segment.departure.iataCode
                                ]?.countryCode || ''
                              }</div>`
                            : ""
                        }
                        ${
                          segment.departure?.terminal
                            ? `<div class="terminal">Terminal ${segment.departure.terminal}</div>`
                            : ""
                        }
                      </div>
                    </div>

                    <div class="label">Arrival</div>
                    <div class="airport-info">
                      <div class="time">${segment.arrival?.at ? new Date(
                        segment.arrival.at
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }) : 'N/A'}</div>
                      <div>
                        <div class="airport">${segment.arrival?.iataCode || 'N/A'}</div>
                        ${
                          (segment.arrival?.iataCode && order.dictionaries?.locations?.[
                            segment.arrival.iataCode
                          ])
                            ? `<div class="city-name">${
                                order.dictionaries.locations[
                                  segment.arrival.iataCode
                                ]?.cityCode || ''
                              }, ${
                                order.dictionaries.locations[
                                  segment.arrival.iataCode
                                ]?.countryCode || ''
                              }</div>`
                            : ""
                        }
                        ${
                          segment.arrival?.terminal
                            ? `<div class="terminal">Terminal ${segment.arrival.terminal}</div>`
                            : ""
                        }
                      </div>
                    </div>
                  </div>

                  <div class="baggage-info">
                    <span class="label">Checked Baggage:</span> 
                    ${
                      order.data.flightOffers?.[0]?.travelerPricings?.[0]
                        ?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0
                    } piece(s)
                  </div>

                  <div class="co2-info">
                    <span class="label">CO2 Emissions:</span> 
                    ${segment.co2Emissions?.[0]?.weight || 'N/A'} ${
                    segment.co2Emissions?.[0]?.weightUnit || ''
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
              ${(order.data.travelers || [])
                .map(
                  (traveler: any) => `
                <div class="traveler-card">
                  <div class="traveler-type">${
                    order.data.flightOffers?.[0]?.travelerPricings?.find(
                      (tp: any) => tp.travelerId === traveler.id
                    )?.travelerType || 'Adult'
                  }</div>
                  <div class="passenger-name">${traveler.name?.lastName || 'N/A'}/${
                    traveler.name?.firstName || 'N/A'
                  }</div>
                  <div style="font-size: 14px; margin-top: 5px;">
                    <div>Date of Birth: ${traveler.dateOfBirth ? new Date(
                      traveler.dateOfBirth
                    ).toLocaleDateString() : 'N/A'}</div>
                    ${
                      traveler.documents && traveler.documents.length > 0
                        ? `<div>Passport: ${traveler.documents[0]?.number || 'N/A'}</div>
                           <div>Nationality: ${traveler.documents[0]?.nationality || 'N/A'}</div>`
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
                  <td>${order.data.flightOffers?.[0]?.price?.base || 'N/A'} ${
        order.data.flightOffers?.[0]?.price?.currency || ''
      }</td>
                </tr>
                <tr>
                  <th style="text-align: left; padding: 8px 0;">Total fare (including taxes)</th>
                  <td>${order.data.flightOffers?.[0]?.price?.grandTotal || 'N/A'} ${
        order.data.flightOffers?.[0]?.price?.currency || ''
      }</td>
                </tr>
              </table>
              <div class="taxes-details">
                Refundable taxes: ${
                  order.data.flightOffers?.[0]?.travelerPricings?.[0]?.price
                    ?.refundableTaxes || 'N/A'
                } ${order.data.flightOffers?.[0]?.price?.currency || ''}
              </div>
            </div>

            <div style="margin-top: 30px;">
              <h3>Additional Information</h3>
              <div style="font-size: 14px; margin-top: 10px;">
                <p><strong>Cabin Baggage Allowance:</strong><br>
                One piece of carry-on baggage per passenger</p>
                <p><strong>Contact Information:</strong><br>
                ${order.data.contacts?.[0]?.companyName || 'N/A'}<br>
                ${order.data.contacts?.[0]?.emailAddress || 'N/A'}<br>
                Phone: ${order.data.contacts?.[0]?.phones?.[0] ? 
                  `+${order.data.contacts[0].phones[0].countryCallingCode || ''} ${order.data.contacts[0].phones[0].number || ''}`
                  : 'N/A'}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Set content and generate PDF
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
      const buffer = Buffer.from(pdfBuffer);

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="emirates-ticket-${orderId}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    //console.error("PDF Download - Error generating PDF:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to generate PDF", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
