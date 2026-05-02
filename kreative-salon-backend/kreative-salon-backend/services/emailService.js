const nodemailer = require("nodemailer");

// Create transporter - configure with your email service
// For Gmail, use app-specific password
// For testing, you can use Ethereal Email: https://ethereal.email/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password"
  }
});

// Email templates
const getBookingRequestEmailTemplate = (name, bookingDetails) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6b21a8;">Kreative Salon</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your booking request! We have received your appointment request.</p>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingDetails.appointmentDate}</p>
        <p><strong>Time:</strong> ${bookingDetails.appointmentTime}</p>
      </div>
      <p>We will review your request and confirm it shortly.</p>
      <p>Thank you for choosing Kreative Salon!</p>
      <p>Best Regards,<br>Kreative Salon Team</p>
    </div>
  `;
};

const getBookingConfirmedEmailTemplate = (name, bookingDetails) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6b21a8;">Kreative Salon</h2>
      <p>Hi ${name},</p>
      <p>Great news! Your booking has been confirmed!</p>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingDetails.appointmentDate}</p>
        <p><strong>Time:</strong> ${bookingDetails.appointmentTime}</p>
        <p><strong>Total:</strong> ₹${bookingDetails.totalAmount}</p>
      </div>
      <p>Please arrive 10 minutes before your scheduled appointment.</p>
      <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
      <p>Thank you for choosing Kreative Salon!</p>
      <p>Best Regards,<br>Kreative Salon Team</p>
    </div>
  `;
};

const getNewBookingNotificationTemplate = (bookingDetails) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6b21a8;">New Booking Request</h2>
      <p>A new booking request has been submitted:</p>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Customer:</strong> ${bookingDetails.name}</p>
        <p><strong>Phone:</strong> ${bookingDetails.phone}</p>
        <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
        <p><strong>Date:</strong> ${bookingDetails.appointmentDate}</p>
        <p><strong>Time:</strong> ${bookingDetails.appointmentTime}</p>
        ${bookingDetails.notes ? `<p><strong>Notes:</strong> ${bookingDetails.notes}</p>` : ""}
      </div>
      <p>Please review and confirm this booking in the admin dashboard.</p>
    </div>
  `;
};

// Send booking request confirmation to customer
const sendBookingRequestEmail = async (email, name, bookingDetails) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || '"Kreative Salon" <noreply@kreativesalon.com>',
      to: email,
      subject: "Booking Request Received - Kreative Salon",
      html: getBookingRequestEmailTemplate(name, bookingDetails)
    });
    console.log(`Booking request email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending booking request email:", error);
    return false;
  }
};

// Send booking confirmation email to customer
const sendBookingConfirmedEmail = async (email, name, bookingDetails) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || '"Kreative Salon" <noreply@kreativesalon.com>',
      to: email,
      subject: "Booking Confirmed! - Kreative Salon",
      html: getBookingConfirmedEmailTemplate(name, bookingDetails)
    });
    console.log(`Booking confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return false;
  }
};

// Send notification to admin about new booking request
const sendNewBookingNotification = async (adminEmail, bookingDetails) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || '"Kreative Salon" <noreply@kreativesalon.com>',
      to: adminEmail,
      subject: "New Booking Request - Kreative Salon",
      html: getNewBookingNotificationTemplate(bookingDetails)
    });
    console.log(`New booking notification email sent to admin`);
    return true;
  } catch (error) {
    console.error("Error sending new booking notification email:", error);
    return false;
  }
};

module.exports = {
  sendBookingRequestEmail,
  sendBookingConfirmedEmail,
  sendNewBookingNotification
};
