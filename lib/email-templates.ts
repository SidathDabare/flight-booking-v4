export function getVerificationEmailTemplate(name: string, verificationUrl: string) {
  return `
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
  `;
}

export function getAdminNotificationTemplate(agentName: string, agentEmail: string) {
  return `
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
  `;
}

export function getAgentApprovalTemplate(agentName: string, dashboardUrl: string) {
  return `
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
        <a href="${dashboardUrl}"
           style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Access Agent Dashboard
        </a>
      </div>

      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>Flight Booking Team</p>
    </div>
  `;
}

export function getAgentRejectionTemplate(agentName: string) {
  return `
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
  `;
}

export function getPasswordResetTemplate(name: string, resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hi ${name},</p>

      <p>We received a request to reset your password for your Flight Booking account. If you made this request, click the button below to reset your password:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #007bff; font-size: 14px;">${resetUrl}</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p><strong>Important:</strong> This password reset link will expire in 1 hour.</p>
        <p><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
        <p>Best regards,<br>Flight Booking Team</p>
      </div>
    </div>
  `;
}

export function getPasswordResetConfirmationTemplate(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #28a745; text-align: center;">Password Successfully Reset</h2>
      <p>Hi ${name},</p>

      <p>This email confirms that your password has been successfully changed.</p>

      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #155724;"><strong>Security Tip:</strong> Make sure to use a strong, unique password and never share it with anyone.</p>
      </div>

      <p>If you did not make this change, please contact our support team immediately as your account may have been compromised.</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>Best regards,<br>Flight Booking Team</p>
      </div>
    </div>
  `;
}

export function getNewMessageNotificationTemplate(
  recipientName: string,
  senderName: string,
  subject: string,
  messageUrl: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #007bff; text-align: center;">New Message Received</h2>
      <p>Hi ${recipientName},</p>

      <p>You have received a new message from <strong>${senderName}</strong>.</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
        <h3 style="margin-top: 0; color: #333;">Subject:</h3>
        <p style="margin: 0; font-size: 16px; color: #555;">${subject}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${messageUrl}"
           style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Message
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #007bff; font-size: 14px;">${messageUrl}</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>Best regards,<br>Flight Booking Team</p>
      </div>
    </div>
  `;
}

export function getNewReplyNotificationTemplate(
  recipientName: string,
  senderName: string,
  subject: string,
  replyPreview: string,
  messageUrl: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #28a745; text-align: center;">New Reply to Your Message</h2>
      <p>Hi ${recipientName},</p>

      <p><strong>${senderName}</strong> has replied to your message.</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="margin-top: 0; color: #333;">Subject:</h3>
        <p style="margin: 0 0 10px 0; font-size: 16px; color: #555;">${subject}</p>
        <h4 style="margin-top: 15px; margin-bottom: 5px; color: #333;">Reply Preview:</h4>
        <p style="margin: 0; color: #666; font-style: italic;">${replyPreview}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${messageUrl}"
           style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Full Conversation
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #28a745; font-size: 14px;">${messageUrl}</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>Best regards,<br>Flight Booking Team</p>
      </div>
    </div>
  `;
}

export function getMessageAssignedNotificationTemplate(
  agentName: string,
  clientName: string,
  subject: string,
  messageUrl: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #17a2b8; text-align: center;">New Message Assigned</h2>
      <p>Hi ${agentName},</p>

      <p>A new message from <strong>${clientName}</strong> has been assigned to you.</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
        <h3 style="margin-top: 0; color: #333;">Subject:</h3>
        <p style="margin: 0; font-size: 16px; color: #555;">${subject}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${messageUrl}"
           style="background-color: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View & Respond
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #17a2b8; font-size: 14px;">${messageUrl}</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>Please respond to the client as soon as possible.</p>
        <p>Best regards,<br>Flight Booking Team</p>
      </div>
    </div>
  `;
}

export function getMessageStatusChangeNotificationTemplate(
  clientName: string,
  subject: string,
  oldStatus: string,
  newStatus: string,
  messageUrl: string
) {
  const statusColors: Record<string, string> = {
    pending: "#ffc107",
    accepted: "#17a2b8",
    resolved: "#28a745",
    closed: "#6c757d",
  };

  const statusColor = statusColors[newStatus] || "#007bff";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: ${statusColor}; text-align: center;">Message Status Updated</h2>
      <p>Hi ${clientName},</p>

      <p>The status of your message has been updated.</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusColor};">
        <h3 style="margin-top: 0; color: #333;">Subject:</h3>
        <p style="margin: 0 0 15px 0; font-size: 16px; color: #555;">${subject}</p>
        <h4 style="margin: 10px 0 5px 0; color: #333;">Status Change:</h4>
        <p style="margin: 0;">
          <span style="background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; text-transform: capitalize;">${oldStatus}</span>
          <span style="margin: 0 10px;">→</span>
          <span style="background-color: ${statusColor}; color: white; padding: 5px 10px; border-radius: 3px; text-transform: capitalize;">${newStatus}</span>
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${messageUrl}"
           style="background-color: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Message
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: ${statusColor}; font-size: 14px;">${messageUrl}</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>Best regards,<br>Flight Booking Team</p>
      </div>
    </div>
  `;
}