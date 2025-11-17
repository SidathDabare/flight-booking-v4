import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { generateAndSendTicket } from "@/lib/ticket-service";
import { sendHotelBookingConfirmation, sendCarRentalConfirmation } from "@/lib/email";
import { User } from "@/lib/db/models/User";

export const POST = async (req: NextRequest) => {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET! as string
    );
  } catch (err) {
    //console.error("[webhooks_POST]", err);
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  //console.log("EVENT TYPE:", event.type);

  // Handle payment intent succeeded for multi-booking (hotels, cars, flights)
  if (event.type === "payment_intent.succeeded") {
    try {
      await connectDB();

      const groupId = paymentIntent.metadata?.groupId;
      if (!groupId) {
        console.error("No groupId in payment intent metadata");
        return new NextResponse("No groupId found", { status: 400 });
      }

      // Update all orders with this groupId to confirmed status
      const updatedOrders = await Order.updateMany(
        { groupId },
        {
          $set: {
            status: "confirmed",
            stripe_payment_intent: paymentIntent.id,
            "metadata.paymentIntentId": paymentIntent.id,
          },
        }
      );

      console.log(`Updated ${updatedOrders.modifiedCount} orders for groupId:`, groupId);

      // Fetch confirmed orders to send email notifications
      const confirmedOrders = await Order.find({ groupId, status: "confirmed" });

      // Get user information
      const userId = paymentIntent.metadata?.userId;
      let userEmail = paymentIntent.metadata?.userEmail;
      let userName = paymentIntent.metadata?.userName;

      // If no user metadata, try to fetch from database
      if (userId && !userEmail) {
        const user = await User.findById(userId);
        if (user) {
          userEmail = user.email;
          userName = user.name;
        }
      }

      // Send confirmation emails for each booking type
      if (userEmail && userName) {
        for (const order of confirmedOrders) {
          try {
            if (order.bookingType === "hotel-booking" && order.data) {
              const guests = order.data.guests || [];
              const guestNames = guests.map((g: any) => `${g.firstName} ${g.lastName}`);

              await sendHotelBookingConfirmation(
                userEmail,
                userName,
                order.metadata?.confirmationNumber || order._id.toString(),
                {
                  name: order.data.hotel?.name || "Hotel",
                  address: `${order.data.hotel?.city}, ${order.data.hotel?.country}`,
                  checkInDate: order.data.stay?.checkInDate || "",
                  checkOutDate: order.data.stay?.checkOutDate || "",
                  numberOfNights: order.data.stay?.numberOfNights || 1,
                  roomType: order.data.room?.name || "Room",
                  guestNames,
                  totalPrice: order.data.pricing?.totalPrice || 0,
                  currency: order.data.pricing?.currency || "USD",
                }
              );
            } else if (order.bookingType === "car-rental" && order.data) {
              const insuranceList = order.data.insurance?.map((ins: any) => ins.name || ins.type) || [];

              await sendCarRentalConfirmation(
                userEmail,
                userName,
                order.metadata?.confirmationNumber || order._id.toString(),
                {
                  vehicleMake: order.data.vehicle?.make || "Vehicle",
                  vehicleModel: order.data.vehicle?.model || "",
                  vehicleCategory: order.data.vehicle?.category || "Car",
                  vendorName: order.data.vendor?.name || "Rental Company",
                  pickupLocation: order.data.rental?.pickupLocation || "",
                  dropoffLocation: order.data.rental?.dropoffLocation || "",
                  pickupDate: order.data.rental?.pickupDate || "",
                  dropoffDate: order.data.rental?.dropoffDate || "",
                  durationDays: order.data.rental?.durationDays || 1,
                  driverName: `${order.data.driver?.firstName} ${order.data.driver?.lastName}`,
                  insurance: insuranceList,
                  totalPrice: order.data.pricing?.totalPrice || 0,
                  currency: order.data.pricing?.currency || "USD",
                }
              );
            }
          } catch (emailError) {
            console.error(`Error sending confirmation email for order ${order._id}:`, emailError);
            // Continue processing other orders even if one email fails
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Multi-booking orders updated successfully",
        modifiedCount: updatedOrders.modifiedCount,
        emailsSent: confirmedOrders.length,
      });
    } catch (error) {
      console.error("Error processing payment_intent.succeeded webhook:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to process webhook", details: error }),
        { status: 500 }
      );
    }
  }

  // Handle checkout session completed (existing flight booking flow)
  if (event.type === "checkout.session.completed") {
    try {
      // Connect to database
      await connectDB();

      // Find the order by amadeusBookingId
      const order = await Order.findOne({
        "data.id": session?.metadata?.amadeusBookingId,
      });

      if (!order) {
        //console.error(
        //  "Order not found for amadeusBookingId:",
        //  session?.metadata?.amadeusBookingId
        //);
        return new NextResponse("Order not found", { status: 404 });
      }

      // Update the order metadata
      const updatedOrder = await Order.findOneAndUpdate(
        { "data.id": session?.metadata?.amadeusBookingId },
        {
          $set: {
            metadata: {
              amadeusBookingId: session?.metadata?.amadeusBookingId,
              bookingDate: session?.metadata?.bookingDate,
              customerEmail: session?.metadata?.customerEmail,
              customerName: session?.metadata?.customerName,
              userId: session?.metadata?.userId,
            },
            status: "confirmed",
            stripe_payment_intent: session.payment_intent,
          },
        },
        { new: true }
      );

      if (!updatedOrder) {
        //console.error("Failed to update order");
        return new NextResponse("Failed to update order", { status: 500 });
      }

      //console.log("Order updated successfully:", updatedOrder);

      // Generate and send ticket PDF via email
      try {
        await generateAndSendTicket(updatedOrder._id.toString());
        //console.log("Ticket generated and sent successfully for order:", updatedOrder._id);
      } catch (ticketError) {
        //console.error("Error generating/sending ticket:", ticketError);
        // Don't fail the webhook if ticket generation fails
      }

      return NextResponse.json({
        success: true,
        message: "Order updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      //console.error("Error processing webhook:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to process webhook", details: error }),
        { status: 500 }
      );
    }
  }

  return new NextResponse("Webhook processed", { status: 200 });
};
// import Stripe from "stripe";
// import { stripe } from "@/lib/stripe";
// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/db/mongoose";
// import Order from "@/lib/db/models/Order";

// export const POST = async (req: NextRequest) => {
//   const body = await req.text();
//   const signature = req.headers.get("Stripe-Signature") as string;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET! as string
//     );
//   } catch (err) {
//     console.error("[webhooks_POST]", err);
//     return new NextResponse("Invalid webhook signature", { status: 400 });
//   }

//   const session = event.data.object as Stripe.Checkout.Session;
//   console.log("SESSION", session);

//   if (event.type === "checkout.session.completed") {
//     try {
//       // Connect to database
//       await connectDB();

//       // Find the order by amadeusBookingId
//       const order = await Order.findOne({
//         "data.id": session?.metadata?.amadeusBookingId,
//       });

//       if (!order) {
//         console.error(
//           "Order not found for amadeusBookingId:",
//           session?.metadata?.amadeusBookingId
//         );
//         return new NextResponse("Order not found", { status: 404 });
//       }

//       // Update the order metadata
//       const updatedOrder = await Order.findOneAndUpdate(
//         { "data.id": session?.metadata?.amadeusBookingId },
//         {
//           $set: {
//             metadata: {
//               amadeusBookingId: session?.metadata?.amadeusBookingId,
//               bookingDate: session?.metadata?.bookingDate,
//               customerEmail: session?.metadata?.customerEmail,
//               customerName: session?.metadata?.customerName,
//               userId: session?.metadata?.userId,
//             },
//             status: "confirmed",
//             stripe_payment_intent: session.payment_intent,
//           },
//         },
//         { new: true }
//       );

//       if (!updatedOrder) {
//         console.error("Failed to update order");
//         return new NextResponse("Failed to update order", { status: 500 });
//       }

//       console.log("Order updated successfully:", updatedOrder);
//       return NextResponse.json({
//         success: true,
//         message: "Order updated successfully",
//         order: updatedOrder,
//       });
//     } catch (error) {
//       console.error("Error processing webhook:", error);
//       return new NextResponse(
//         JSON.stringify({ error: "Failed to process webhook", details: error }),
//         { status: 500 }
//       );
//     }
//   }

//   return new NextResponse("Webhook processed", { status: 200 });
// };
