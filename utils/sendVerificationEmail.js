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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Taskify</h1>
          <p style="color: #666;">Thank you for registering. Please click the button below to verify your account:</p>
          <a href="http://localhost:3000/verify/${verificationToken}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Account
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            http://localhost:3000/verify/${verificationToken}
          </p>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
}
