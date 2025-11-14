import transporter from "../config/nodemailer.js";
import config from "../config/settings.js";

export const sendOTPEmail = async (email, otp, fullname) => {
  try {
    const mailOptions = {
      from: `"Online Auction" <${config.SENDER_EMAIL}>`, // Use verified SENDER_EMAIL
      to: email,
      subject: "Email Verification OTP for Online Auction",
      html: `<p>Dear ${fullname},</p><p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
      text: `Your OTP for email verification is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP has been sent to your email" };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// export const sendPasswordResetEmail = async (email, resetToken, fullname) => {
//   const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`;

// };
