import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { sendVerificationEmail, notifyAdminNewAgent } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["client", "agent"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: role === "client" ? true : false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email with token
    await sendVerificationEmail(email, name, verificationToken);

    // If agent registration, notify admin
    if (role === "agent") {
      await notifyAdminNewAgent(name, email);
    }

    return NextResponse.json(
      { 
        message: "User registered successfully", 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}