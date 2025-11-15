import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { sendPasswordResetConfirmation } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

/**
 * POST /api/auth/reset-password
 *
 * Resets user password with valid token
 *
 * Body:
 * {
 *   token: string
 *   password: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: "Password reset successful"
 * }
 *
 * Errors:
 * - 400: Validation error, invalid token, expired token
 * - 500: Internal server error
 *
 * Security Notes:
 * - Validates token and expiration
 * - Hashes password with bcrypt (12 rounds)
 * - Clears reset token after successful reset
 * - Sends confirmation email
 */

const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must not exceed 100 characters" }),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);
    const { token, password } = validated;

    // Connect to database
    await connectToDatabase();

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired password reset token. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email (non-blocking)
    sendPasswordResetConfirmation(user.email, user.name).catch((error) => {
      console.error("Failed to send password reset confirmation:", error);
      // Don't fail the request if confirmation email fails
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successful. You can now sign in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Log error server-side
    console.error("Reset password error:", error);

    // Generic error response (don't leak sensitive info)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password. Please try again later.",
      },
      { status: 500 }
    );
  }
}
