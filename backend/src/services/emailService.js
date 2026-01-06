import transporter from "../config/nodemailer.js";
import config from "../config/settings.js";

export const sendOTPEmail = async (email, otp, fullname, purpose) => {
  try {
    const mailOptions = {
      from: `"Online Auction" <${config.SENDER_EMAIL}>`,
      to: email,
      subject: "Email Verification OTP for Online Auction",
      html: `<p>Dear ${fullname},</p><p>Your OTP for ${purpose} is: <strong>${otp}</strong></p>`,
      text: `Your OTP for ${purpose} is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP has been sent to your email" };
  } catch (error) {
    throw new Error("Failed to send OTP email");
  }
};

export const sendEmail = async (email, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Online Auction" <${config.SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Bid place successfully (To the bidder)
export const sendBidSuccessEmailToBidder = async (
  bidderEmail,
  fullName,
  productName,
  amount
) => {
  const subject = `[Bid Confirmed] You bet on ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #27ae60;">Bid Successful!</h2>
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>You have successfully placed a bid on <strong>${productName}</strong>.</p>
      <p>Your Bid Amount: <strong style="font-size: 18px;">$${parseFloat(
        amount
      ).toLocaleString()}</strong></p>
      <p>We will notify you if someone outbids you.</p>
      <hr>
      <p style="font-size: 12px; color: #777;">Online Auction System</p>
    </div>
  `;
  return sendEmail(bidderEmail, subject, html);
};

// Bid place successfully (To the seller)
export const sendBidNotificationToSeller = async (
  sellerEmail,
  productName,
  amount,
  bidderName
) => {
  const subject = `[New Bid Placed] on your product ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #2980b9;">Good News!</h2>
      <p>Someone placed a new bid on your product <strong>${productName}</strong>.</p>
      <ul>
        <li><strong>Bidder:</strong> ${bidderName}</li>
        <li><strong>Amount:</strong> $${parseFloat(
          amount
        ).toLocaleString()}</li>
      </ul>
      <p>Check your dashboard for more details.</p>
    </div>
  `;
  return sendEmail(sellerEmail, subject, html);
};

// Bid place successfully (To the previous highest bidder)
export const sendOutbidEmailToPreviousBidder = async (
  email,
  fullName,
  productName,
  newAmount,
  productId
) => {
  const subject = `[Alert] You have been outbid on ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e74c3c;">
      <h2 style="color: #c0392b;">You've been outbid!</h2>
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Another user has placed a higher bid on <strong>${productName}</strong>.</p>
      <p>Current Highest Bid: <strong>$${parseFloat(
        newAmount
      ).toLocaleString()}</strong></p>
      <p><a href="${
        config.CLIENT_URL
      }/products/${productId}" style="background-color: #c0392b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Bid Again Now</a></p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

// Bidder rejected (To the banned bidder)
export const sendBidRejectNotification = async (
  email,
  fullName,
  productName
) => {
  const subject = `[Notification] Access Revoked for ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>Hello ${fullName},</h3>
      <p>The seller has revoked your right to bid on the product <strong>${productName}</strong>.</p>
      <p>All your previous bids on this item have been invalidated.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

// The auction ends with no sale (To the seller)
export const sendAuctionNoSaleNotification = async (email, productName) => {
  const subject = `[Auction Ended] No bidders for ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Auction Ended</h2>
      <p>Your product <strong>${productName}</strong> has ended, but unfortunately, there were no valid bids.</p>
      <p>You can relist the item at any time.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

// Auction ends with the winner (To the seller)
export const sendAuctionEndedNotificationToSeller = async (
  sellerEmail,
  productName,
  amount,
  winnerName
) => {
  const subject = `[Auction Ended] ${productName} was sold!`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #27ae60;">Auction Success</h2>
      <p>Your product <strong>${productName}</strong> has ended successfully.</p>
      <p><strong>Winner:</strong> ${winnerName}</p>
      <p><strong>Final Price:</strong> $${parseFloat(
        amount
      ).toLocaleString()}</p>
      <p>Please contact the winner to arrange delivery.</p>
    </div>
  `;
  return sendEmail(sellerEmail, subject, html);
};

// Auction ends (To the winner bidder)
export const sendAuctionWinNotification = async (
  bidderEmail,
  productName,
  amount,
  winnerName
) => {
  const subject = `[Congratulations] You won ${productName}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h1 style="color: #f1c40f;">🎉 Congratulations!</h1>
      <p>Dear <strong>${winnerName}</strong>,</p>
      <p>You are the winner of the auction for <strong>${productName}</strong>.</p>
      <p>Winning Price: <strong>$${parseFloat(
        amount
      ).toLocaleString()}</strong></p>
      <p>Please log in to your account to communicate with the seller and finalize the payment.</p>
    </div>
  `;
  return sendEmail(bidderEmail, subject, html);
};

// Question from a bidder (To the seller)
export const sendQuestionNotification = async (
  sellerEmail,
  productName,
  question,
  productId
) => {
  const productUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/products/${productId}`;

  return sendEmail(
    sellerEmail,
    `New Question for ${productName}`,
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">New Question on Your Product</h2>
        <p>You have received a new question for: <strong>${productName}</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Question:</strong></p>
          <p style="margin: 10px 0 0 0;">${question}</p>
        </div>
        <p>
          <a href="${productUrl}" 
             style="display: inline-block; background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            View Product & Answer Question
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Click the button above to view the product details and answer this question.
        </p>
      </div>
    `
  );
};

// Answer from a seller (To all bidders ask questions in that product)
export const sendAnswerNotification = async (
  receiverEmail,
  productName,
  question,
  answer,
  productId
) => {
  return sendEmail(
    receiverEmail,
    `Seller Replied: ${productName}`,
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Seller Answered Your Question</h2>
        <p>The seller has responded to a question on: <strong>${productName}</strong></p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #666; margin: 15px 0;">
          <p style="margin: 0; color: #666;"><strong>Your Question:</strong></p>
          <p style="margin: 10px 0 0 0;">${question}</p>
        </div>
        <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0;">
          <p style="margin: 0; color: #2e7d32;"><strong>Seller's Answer:</strong></p>
          <p style="margin: 10px 0 0 0;">${answer}</p>
        </div>
      </div>
    `
  );
};

// Product description updated (To all current bidders)
export const sendDescriptionUpdateNotification = async (
  bidderEmail,
  bidderName,
  productName,
  productId
) => {
  const productUrl = `${config.CLIENT_URL}/products/${productId}`;
  const subject = `[Update] Product description updated for ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #3498db; border-radius: 8px;">
      <h2 style="color: #2980b9;">📝 Product Description Updated</h2>
      <p>Hello <strong>${bidderName}</strong>,</p>
      <p>The seller has updated the description for <strong>${productName}</strong>, a product you are currently bidding on.</p>
      <p>We recommend reviewing the updated description to stay informed about the product details.</p>
      <p>
        <a href="${productUrl}" 
           style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Updated Product
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">Online Auction System</p>
    </div>
  `;
  return sendEmail(bidderEmail, subject, html);
};

// Password reset by admin (To the user)
export const sendAdminPasswordResetNotification = async (
  userEmail,
  fullName,
  temporaryPassword
) => {
  const subject = "[Important] Your Password Has Been Reset";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #e74c3c;">Password Reset Notification</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Your password has been reset by an administrator.</p>
      <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0;">
        <p style="margin: 0;"><strong>Your temporary password:</strong></p>
        <p style="font-size: 18px; font-family: monospace; margin: 10px 0 0 0; color: #d63031;">${temporaryPassword}</p>
      </div>
      <p style="color: #e74c3c;"><strong>⚠️ Important Security Notice:</strong></p>
      <ul style="color: #555;">
        <li>Please log in and change your password immediately</li>
        <li>Do not share this temporary password with anyone</li>
        <li>This is a system-generated password for security purposes</li>
      </ul>
      <p>
        <a href="${config.CLIENT_URL}/auth/signin" 
           style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Log In Now
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        If you did not request this change, please contact support immediately.
      </p>
    </div>
  `;
  return sendEmail(userEmail, subject, html);
};
