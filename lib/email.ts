import { Resend } from "resend";
import {
  getPasswordResetTemplate,
  getPasswordResetConfirmationTemplate,
  getNewMessageNotificationTemplate,
  getNewReplyNotificationTemplate,
  getMessageAssignedNotificationTemplate,
  getMessageStatusChangeNotificationTemplate,
  getHotelBookingConfirmationTemplate,
  getCarRentalConfirmationTemplate,
} from "./email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, name: string, token: string) {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Welcome! Please verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Welcome to Flight Booking, ${name}!</h2>
          <p>Thank you for registering with us. Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff; font-size: 14px;">${verificationUrl}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Best regards,<br>Flight Booking Team</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export async function notifyAdminNewAgent(agentName: string, agentEmail: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("ADMIN_EMAIL not configured");
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: adminEmail,
      subject: "New Agent Registration - Approval Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Agent Registration</h2>
          <p>A new agent has registered and requires approval:</p>
          <ul>
            <li><strong>Name:</strong> ${agentName}</li>
            <li><strong>Email:</strong> ${agentEmail}</li>
          </ul>
          <p>Please log in to the admin dashboard to review and approve this agent.</p>
          <p>Best regards,<br>Flight Booking System</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

export async function notifyAgentApproval(agentEmail: string, agentName: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: agentEmail,
      subject: "Agent Account Approved!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745; text-align: center;">Congratulations, ${agentName}!</h2>
          <p>Your agent account has been approved by our administrators. You now have full access to the agent dashboard and booking management system.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #555;">
              <li>Access the agent dashboard</li>
              <li>Manage flight bookings for your clients</li>
              <li>View booking history and reports</li>
              <li>Assist customers with their travel needs</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Access Agent Dashboard
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>Flight Booking Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending approval notification:", error);
  }
}

export async function notifyAgentRejection(agentEmail: string, agentName: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: agentEmail,
      subject: "Agent Application Update",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Agent Application Update</h2>
          <p>Dear ${agentName},</p>

          <p>Thank you for your interest in becoming an agent with Flight Booking. After careful review of your application, we regret to inform you that we cannot approve your agent account at this time.</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Possible reasons for this decision:</h3>
            <ul style="color: #555;">
              <li>Incomplete application information</li>
              <li>Current agent capacity limitations</li>
              <li>Business requirements not met</li>
              <li>Verification issues</li>
            </ul>
          </div>

          <p>You are welcome to apply again in the future. If you believe this decision was made in error or if you have additional information to provide, please contact our support team.</p>

          <p>We appreciate your understanding and interest in our platform.</p>

          <p>Best regards,<br>Flight Booking Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending rejection notification:", error);
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Password Reset Request - Flight Booking",
      html: getPasswordResetTemplate(name, resetUrl),
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

export async function sendPasswordResetConfirmation(email: string, name: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Password Successfully Reset - Flight Booking",
      html: getPasswordResetConfirmationTemplate(name),
    });
  } catch (error) {
    console.error("Error sending password reset confirmation:", error);
    // Don't throw error for confirmation email - it's not critical
  }
}

export async function sendNewMessageNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  subject: string,
  messageId: string
) {
  try {
    const messageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/messages?id=${messageId}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: recipientEmail,
      subject: `New Message: ${subject}`,
      html: getNewMessageNotificationTemplate(
        recipientName,
        senderName,
        subject,
        messageUrl
      ),
    });
  } catch (error) {
    console.error("Error sending new message notification:", error);
    // Don't throw error - email is not critical for the operation
  }
}

export async function sendNewReplyNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  subject: string,
  replyContent: string,
  messageId: string,
  recipientRole: string
) {
  try {
    // Determine the correct URL based on recipient role
    let messageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`;
    if (recipientRole === 'client') {
      messageUrl += `/client/messages?id=${messageId}`;
    } else if (recipientRole === 'agent') {
      messageUrl += `/agent/messages?id=${messageId}`;
    } else {
      messageUrl += `/admin/messages?id=${messageId}`;
    }

    // Create reply preview (first 100 characters)
    const replyPreview = replyContent.length > 100
      ? replyContent.substring(0, 100) + '...'
      : replyContent;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: recipientEmail,
      subject: `New Reply: ${subject}`,
      html: getNewReplyNotificationTemplate(
        recipientName,
        senderName,
        subject,
        replyPreview,
        messageUrl
      ),
    });
  } catch (error) {
    console.error("Error sending new reply notification:", error);
    // Don't throw error - email is not critical for the operation
  }
}

export async function sendMessageAssignedNotification(
  agentEmail: string,
  agentName: string,
  clientName: string,
  subject: string,
  messageId: string
) {
  try {
    const messageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/agent/messages?id=${messageId}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: agentEmail,
      subject: `Message Assigned: ${subject}`,
      html: getMessageAssignedNotificationTemplate(
        agentName,
        clientName,
        subject,
        messageUrl
      ),
    });
  } catch (error) {
    console.error("Error sending message assigned notification:", error);
    // Don't throw error - email is not critical for the operation
  }
}

export async function sendMessageStatusChangeNotification(
  clientEmail: string,
  clientName: string,
  subject: string,
  oldStatus: string,
  newStatus: string,
  messageId: string
) {
  try {
    const messageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/client/messages?id=${messageId}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: clientEmail,
      subject: `Message Status Updated: ${subject}`,
      html: getMessageStatusChangeNotificationTemplate(
        clientName,
        subject,
        oldStatus,
        newStatus,
        messageUrl
      ),
    });
  } catch (error) {
    console.error("Error sending status change notification:", error);
    // Don't throw error - email is not critical for the operation
  }
}

export async function sendHotelBookingConfirmation(
  customerEmail: string,
  customerName: string,
  confirmationNumber: string,
  hotelData: {
    name: string;
    address: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    roomType: string;
    guestNames: string[];
    totalPrice: number;
    currency: string;
  }
) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: customerEmail,
      subject: `Hotel Booking Confirmed - ${confirmationNumber}`,
      html: getHotelBookingConfirmationTemplate(
        customerName,
        confirmationNumber,
        hotelData.name,
        hotelData.address,
        hotelData.checkInDate,
        hotelData.checkOutDate,
        hotelData.numberOfNights,
        hotelData.roomType,
        hotelData.guestNames,
        hotelData.totalPrice,
        hotelData.currency
      ),
    });
    console.log("Hotel booking confirmation email sent to:", customerEmail);
  } catch (error) {
    console.error("Error sending hotel booking confirmation:", error);
    // Don't throw error - email is not critical for the operation
  }
}

export async function sendCarRentalConfirmation(
  customerEmail: string,
  customerName: string,
  confirmationNumber: string,
  carData: {
    vehicleMake: string;
    vehicleModel: string;
    vehicleCategory: string;
    vendorName: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    dropoffDate: string;
    durationDays: number;
    driverName: string;
    insurance: string[];
    totalPrice: number;
    currency: string;
  }
) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: customerEmail,
      subject: `Car Rental Confirmed - ${confirmationNumber}`,
      html: getCarRentalConfirmationTemplate(
        customerName,
        confirmationNumber,
        carData.vehicleMake,
        carData.vehicleModel,
        carData.vehicleCategory,
        carData.vendorName,
        carData.pickupLocation,
        carData.dropoffLocation,
        carData.pickupDate,
        carData.dropoffDate,
        carData.durationDays,
        carData.driverName,
        carData.insurance,
        carData.totalPrice,
        carData.currency
      ),
    });
    console.log("Car rental confirmation email sent to:", customerEmail);
  } catch (error) {
    console.error("Error sending car rental confirmation:", error);
    // Don't throw error - email is not critical for the operation
  }
}