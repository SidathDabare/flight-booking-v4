import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" }, 
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" }, 
        { status: 400 }
      );
    }

    // Update user using findByIdAndUpdate for more reliable field clearing
    const updateData: any = {
      emailVerified: new Date(),
      $unset: {
        emailVerificationToken: 1,
        emailVerificationExpires: 1
      }
    };
    
    // Auto-approve clients after email verification
    if (user.role === "client") {
      updateData.isApproved = true;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    );

    //console.log('Updated user verification fields:', {
    //  emailVerified: updatedUser?.emailVerified,
    //  emailVerificationToken: updatedUser?.emailVerificationToken,
    //  emailVerificationExpires: updatedUser?.emailVerificationExpires,
    //  isApproved: updatedUser?.isApproved
    //});

    return NextResponse.json({ 
      message: "Email verified successfully",
      isApproved: updatedUser?.isApproved || false,
      role: updatedUser?.role || user.role
    });
  } catch (error) {
    //console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}