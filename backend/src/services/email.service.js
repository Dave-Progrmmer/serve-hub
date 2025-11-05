import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "opabunmidavid@gmail.com",
    pass: "ncqrzytcnxljswxy", // no spaces
  },
});


// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service error:", error.message);
  } else {
    console.log("✅ Email service is ready");
  }
});

// Base email sender
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "LocalServices"} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // In development, log the preview URL
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to LocalServices! 🎉";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome ${user.name}! 👋</h2>
      <p>Thank you for joining LocalServices as a <strong>${user.role}</strong>.</p>
      
      ${user.role === "provider" 
        ? `<p>You can now start creating services and connect with clients in your area!</p>`
        : `<p>You can now browse and book services from trusted local providers!</p>`
      }
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/login" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Get Started
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        If you have any questions, feel free to reply to this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} LocalServices. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text: `Welcome ${user.name}! Thank you for joining LocalServices.`,
  });
};

export const sendBookingConfirmation = async (booking, client, provider, service) => {
  const subject = "Booking Confirmation 📅";
  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Email to client
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Booking Confirmed! ✅</h2>
      <p>Hi ${client.name},</p>
      <p>Your booking has been confirmed!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Service:</strong> ${service.title}</p>
        <p><strong>Provider:</strong> ${provider.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Price:</strong> $${booking.totalPrice}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" 
           style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Booking
        </a>
      </div>
      
      <p style="color: #666;">
        You can contact ${provider.name} at: ${provider.email}
      </p>
    </div>
  `;

  // Email to provider
  const providerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Booking Received! 🔔</h2>
      <p>Hi ${provider.name},</p>
      <p>You have a new booking for your service!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Service:</strong> ${service.title}</p>
        <p><strong>Client:</strong> ${client.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Price:</strong> $${booking.totalPrice}</p>
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
          Accept Booking
        </a>
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" 
           style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Decline
        </a>
      </div>
      
      <p style="color: #666;">
        Client contact: ${client.email} ${client.phone ? `| ${client.phone}` : ""}
      </p>
    </div>
  `;

  // Send to both
  await sendEmail({
    to: client.email,
    subject: "Booking Confirmation",
    html: clientHtml,
    text: `Your booking for ${service.title} on ${formattedDate} has been confirmed.`,
  });

  await sendEmail({
    to: provider.email,
    subject: "New Booking Received",
    html: providerHtml,
    text: `You have a new booking from ${client.name} for ${service.title} on ${formattedDate}.`,
  });

  return { success: true };
};

export const sendBookingStatusUpdate = async (booking, user, newStatus) => {
  const subject = `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusMessages = {
    accepted: "Your booking has been accepted by the provider! ✅",
    completed: "Your booking has been marked as completed. Please leave a review! ⭐",
    cancelled: "Your booking has been cancelled. ❌",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Booking Status Update</h2>
      <p>Hi ${user.name},</p>
      <p>${statusMessages[newStatus] || `Booking status updated to: ${newStatus}`}</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>New Status:</strong> <span style="color: ${newStatus === 'accepted' ? '#4CAF50' : newStatus === 'cancelled' ? '#f44336' : '#2196F3'}">${newStatus.toUpperCase()}</span></p>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" 
           style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Booking
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text: `Your booking status has been updated to: ${newStatus}`,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const subject = "Password Reset Request 🔐";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #666;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
      
      <p style="color: #999; font-size: 12px;">
        Or copy and paste this URL into your browser:<br>
        ${resetUrl}
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text: `Reset your password: ${resetUrl}`,
  });
};

export const sendNewReviewNotification = async (provider, review, client, service) => {
  const subject = "New Review Received! ⭐";
  const stars = "⭐".repeat(review.rating);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">You've received a new review!</h2>
      <p>Hi ${provider.name},</p>
      <p>${client.name} left a review for your service: <strong>${service.title}</strong></p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 24px; margin: 0;">${stars}</p>
        <p style="margin: 10px 0;"><strong>Rating:</strong> ${review.rating}/5</p>
        ${review.comment ? `<p><strong>Comment:</strong><br>"${review.comment}"</p>` : ""}
        <p style="color: #666; font-size: 14px; margin-top: 15px;">- ${client.name}</p>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/services/${service._id}" 
           style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Service
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: provider.email,
    subject,
    html,
    text: `${client.name} left a ${review.rating}-star review for ${service.title}`,
  });
};

export default { sendEmail, sendWelcomeEmail, sendBookingConfirmation, sendBookingStatusUpdate, sendPasswordResetEmail, sendNewReviewNotification };