import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
export default async function sendVerificationEmail(email, verificationToken) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail as the service
      auth: {
        user: "yilmaz8596@gmail.com", // Your Gmail address
        pass: process.env.SMTP_SECRET, // App password generated in Step 3
      },
    });

    const mailOptions = {
      from: "yilmaz8596@gmail.com",
      to: email,
      subject: "Account verification",
      text: "Welcome to Taskify. Please click on the following link to verify your account",
      html: `<a href="http://localhost:3000/verify/${verificationToken}">Verify</a>`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
}
