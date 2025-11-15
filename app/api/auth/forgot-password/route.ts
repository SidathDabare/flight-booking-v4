import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";

/**
 * POST /api/auth/forgot-password
 *
 * Initiates password reset process for a user
 *
 * Body:
 * {
 *   email: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: "Password reset email sent"
 * }
 *
 * Errors:
 * - 400: Validation error
 * - 500: Internal server error
 *
 * Security Notes:
 * - Always returns success even if email doesn't exist (prevent user enumeration)
 * - Token expires in 1 hour
 * - Uses cryptographically secure random token
 */

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = forgotPasswordSchema.parse(body);
    const { email } = validated;

    // Connect to database
    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // SECURITY: Always return success to prevent user enumeration
    // Even if user doesn't exist, we return the same response
    if (!user) {
      // Add a small delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 100));
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link.",
        },
        { status: 200 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Email not verified. Please verify your email first.",
        },
        { status: 400 }
      );
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing (security best practice)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 1 hour
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with reset token
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Log error server-side
    console.error("Forgot password error:", error);

    // Generic error response (don't leak sensitive info)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process password reset request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
