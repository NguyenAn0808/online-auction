import transporter from "../config/nodemailer.js";
import config from "../config/settings.js";

export const sendOTPEmail = async (email, otp, fullname, purpose) => {
  try {
    const mailOptions = {
      from: `"Online Auction" <${config.SENDER_EMAIL}>`, // Use verified SENDER_EMAIL
      to: email,
      subject: "Email Verification OTP for Online Auction",
      html: `<p>Dear ${fullname},</p><p>Your OTP for ${purpose} is: <strong>${otp}</strong></p>`,
      text: `Your OTP for ${purpose} is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP has been sent to your email" };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export const sendEmail = async (email, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Online Auction" <${config.SENDER_EMAIL}>`, // Use verified SENDER_EMAIL
      to: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error);
    return { success: false, error };
  }
};

// Bid place successfully (To the bidder)
export const sendBidSuccessEmailToBidder = async (
  bidderEmail,
  fullname,
  productName,
  amount
) => {
  const subject = `[Bid Confirmed] You bet on ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #27ae60;">Bid Successful!</h2>
      <p>Hello <strong>${fullname}</strong>,</p>
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
  fullname,
  productName,
  newAmount
) => {
  const subject = `[Alert] You have been outbid on ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e74c3c;">
      <h2 style="color: #c0392b;">You've been outbid!</h2>
      <p>Hello <strong>${fullname}</strong>,</p>
      <p>Another user has placed a higher bid on <strong>${productName}</strong>.</p>
      <p>Current Highest Bid: <strong>$${parseFloat(
        newAmount
      ).toLocaleString()}</strong></p>
      <p><a href="${
        config.CLIENT_URL
      }/products/${productName}" style="background-color: #c0392b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Bid Again Now</a></p>
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
      <h3>Hello ${fullname},</h3>
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
  return sendEmail(email, subject, html);
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
  question
) => {
  return sendEmail(
    sellerEmail,
    `New Question for ${productName}`,
    `<p><strong>Question:</strong> ${question}</p>`
  );
};

// Answer from a seller (To all bidders ask questions in that product)
export const sendAnswerNotification = async (
  receiverEmail,
  productName,
  question,
  answer
) => {
  return sendEmail(
    receiverEmail,
    `Seller Replied: ${productName}`,
    `<p><strong>Q:</strong> ${question}</p><p><strong>A:</strong> ${answer}</p>`
  );
};
