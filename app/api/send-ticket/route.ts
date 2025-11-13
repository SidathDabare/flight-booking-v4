import { NextRequest, NextResponse } from "next/server";
import { generateAndSendTicket } from "@/lib/ticket-service";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    await generateAndSendTicket(orderId);

    return NextResponse.json({
      success: true,
      message: `Ticket generated and sent successfully for order: ${orderId}`,
    });
  } catch (error) {
    console.error("Error generating and sending ticket:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to generate and send ticket", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};