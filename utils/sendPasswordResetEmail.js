import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yilmaz8596@gmail.com",
        pass: process.env.SMTP_SECRET,
      },
    });
    const mailOptions = {
      from: "yilmaz8596@gmail.com",
      to: email,
      subject: "Password Reset",
      text: "You are receiving this email because you requested a password reset for your account.",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Reset</h1>
            <p style="color: #666;">You are receiving this email because you requested a password reset for your account.</p>
            <a href="http://localhost:3000/reset-password/${resetToken}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link in your browser:<br>
              http://localhost:3000/reset-password/${resetToken}
            </p>
          </div>
        `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};
