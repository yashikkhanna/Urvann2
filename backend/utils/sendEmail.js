// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      service: process.env.SMTP_SERVICE, // Gmail, etc.
      port: process.env.SMTP_PORT || 587,
      secure: false, // use true for 465, false for other ports
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Urvann Plant Store" <${process.env.SMTP_MAIL}>`, // looks better in inbox
      to: email,
      subject,
      html: message, // using HTML instead of plain text
    };

    await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

export default sendEmail;
