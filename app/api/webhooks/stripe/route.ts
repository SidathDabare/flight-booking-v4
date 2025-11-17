import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { generateAndSendTicket } from "@/lib/ticket-service";

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
  //console.log("SESSION", session);

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
