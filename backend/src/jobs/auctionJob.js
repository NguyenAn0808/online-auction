import cron from "node-cron";
import pool from "../config/database.js";
import ProductModel from "../models/product.model.js";
import Bid from "../models/Bid.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import OrderMessage from "../models/OrderMessage.js";
import * as EmailService from "../services/emailService.js";

const finalizeAuction = async (product) => {
  try {
    console.log(`[Auction] Processing: ${product.name} (${product.id})`);

    const winner = await Bid.getHighest(product.id);

    if (winner) {
      // STEP 1: Get winner and seller details
      const winnerUser = await User.findById(winner.bidder_id);
      const sellerUser = await User.findById(product.seller_id);

      // STEP 2: Check if order exists, if not CREATE it
      let order = await Order.findByProduct(product.id);

      if (!order) {
        console.log(
          `[Auction] ⚠️ No order found for ${product.name} - creating order...`
        );

        // Create order automatically
        order = await Order.create({
          productId: product.id,
          buyerId: winner.bidder_id,
          sellerId: product.seller_id,
          finalPrice: winner.amount,
          proofImage: "", // Buyer will upload later
          address: "", // Buyer will provide later
        });

        console.log(`[Auction] ✅ Order created: ${order.id}`);
      } else {
        console.log(`[Auction] Order already exists: ${order.id}`);
      }

      // STEP 3: Check if notifications already sent using notification_sent flag
      const notificationCheck = await pool.query(
        `SELECT notification_sent FROM orders WHERE id = $1`,
        [order.id]
      );

      const alreadySent = notificationCheck.rows[0]?.notification_sent;

      if (alreadySent) {
        console.log(
          `[Auction] Notifications already sent for order ${order.id} - skipping`
        );
        return;
      }

      // STEP 4: Get product image for chatbox message
      let productImage = null;
      try {
        const imageResult = await pool.query(
          `SELECT image_url FROM product_images 
           WHERE product_id = $1 
           ORDER BY is_thumbnail DESC, position ASC 
           LIMIT 1`,
          [product.id]
        );
        productImage = imageResult.rows[0]?.image_url;
      } catch (err) {
        console.error(`[Auction] Failed to get product image:`, err);
      }

      // STEP 5: Send chatbox welcome message with rich formatting
      const welcomeMessage = `🎉 **Auction Ended Successfully!**

**Product:** ${product.name}
**Winner:** ${winnerUser?.full_name || "Winner"}
**Final Price:** $${parseFloat(winner.amount).toLocaleString()}

${productImage ? `![Product Image](${productImage})` : ""}

---

**Dear ${winnerUser?.full_name || "Winner"},**

Congratulations on winning the auction! 🏆

**Next Steps:**
1. Please provide your shipping address
2. Upload payment proof showing the transfer of **$${parseFloat(
        winner.amount
      ).toLocaleString()}**

**Seller:** ${sellerUser?.full_name || "Seller"}

We look forward to completing this transaction successfully!`;

      await OrderMessage.create({
        orderId: order.id,
        senderId: product.seller_id,
        message: welcomeMessage,
      });
      console.log(`[Auction] ✅ Chat message sent to order chatbox`);

      // STEP 5: Send emails
      // Email to winner bidder
      if (winnerUser?.email) {
        await EmailService.sendAuctionWinNotification(
          winnerUser.email,
          product.name,
          winner.amount,
          winnerUser.full_name
        );
        console.log(`[Auction] ✅ Winner email sent to ${winnerUser.email}`);
      }

      // Email to seller
      if (sellerUser?.email) {
        await EmailService.sendAuctionEndedNotificationToSeller(
          sellerUser.email,
          product.name,
          winner.amount,
          winnerUser?.full_name || "Winner"
        );
        console.log(`[Auction] ✅ Seller email sent to ${sellerUser.email}`);
      }

      // STEP 6: Mark notifications as sent
      await pool.query(
        `UPDATE orders SET notification_sent = TRUE WHERE id = $1`,
        [order.id]
      );

      console.log(
        `[Auction] ✅ Notifications sent for ${product.name} - Winner: ${winnerUser?.full_name}, Price: $${winner.amount}`
      );
    } else {
      // No winner - Auction ended without bids
      console.log(
        `[Auction] No bids for ${product.name} - skipping notifications`
      );
    }
  } catch (error) {
    console.error(`[Auction] ❌ Error processing ${product.id}:`, error);
  }
};

/**
 * Activate upcoming auctions when their start time arrives
 */
const activateUpcomingAuctions = async () => {
  try {
    const query = `
      UPDATE products 
      SET status = 'active' 
      WHERE status = 'upcoming' AND start_time <= NOW()
      RETURNING id, name
    `;
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      console.log(
        `[Auction] Activated ${result.rows.length} upcoming auction(s)`
      );
      result.rows.forEach((product) => {
        console.log(`  - Product ${product.id}: ${product.name}`);
      });
    }
  } catch (error) {
    console.error("[Auction] Failed to activate upcoming auctions:", error);
  }
};

/**
 * Process expired auctions with orders
 * Runs every 15 seconds to send notifications for completed auctions
 */
const processExpiredAuctions = async () => {
  try {
    // Find ended products with bids (potential winners) that haven't sent notifications yet
    const query = `
      SELECT DISTINCT p.* FROM products p
      INNER JOIN bids b ON p.id = b.product_id
      LEFT JOIN orders o ON p.id = o.product_id
      WHERE p.status = 'ended' 
        AND (o.id IS NULL OR o.notification_sent = FALSE)
    `;

    const result = await pool.query(query);
    const allProductsToProcess = result.rows;

    if (allProductsToProcess.length > 0) {
      console.log(
        `[Auction] Found ${allProductsToProcess.length} auctions to finalize`
      );
      for (const product of allProductsToProcess) {
        await finalizeAuction(product);
      }
    }
  } catch (error) {
    console.error("[Auction] Failed to process expired auctions:", error);
  }
};

/**
 * End active auctions when their end_time arrives
 * Updates product status from 'active' to 'ended'
 */
const endExpiredAuctions = async () => {
  try {
    const query = `
      UPDATE products 
      SET status = 'ended' 
      WHERE status = 'active' AND end_time <= NOW()
      RETURNING id, name
    `;
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      console.log(`[Auction] Ended ${result.rows.length} expired auction(s)`);
      result.rows.forEach((product) => {
        console.log(`  - Product ${product.id}: ${product.name}`);
      });
    }
  } catch (error) {
    console.error("[Auction] Failed to end expired auctions:", error);
  }
};

/**
 * Notify sellers of auctions that ended without any bids
 */
const notifySellersOfNoBidAuctions = async () => {
  try {
    // Find ended auctions with no bids and no notification sent
    const query = `
      SELECT p.*, u.email as seller_email, u.full_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN bids b ON p.id = b.product_id
      WHERE p.status = 'ended' 
        AND p.end_time <= NOW()
        AND p.no_bid_notification_sent IS NOT TRUE
        AND b.id IS NULL
      GROUP BY p.id, u.id
    `;

    const result = await pool.query(query);
    const productsWithNoBids = result.rows;

    if (productsWithNoBids.length > 0) {
      console.log(
        `[Auction] Found ${productsWithNoBids.length} auctions with no bids`
      );

      for (const product of productsWithNoBids) {
        try {
          // Send email to seller
          if (product.seller_email) {
            await EmailService.sendAuctionNoSaleNotification(
              product.seller_email,
              product.name
            );
            console.log(
              `[Auction] ✅ No-bid notification sent to seller: ${product.seller_email} for ${product.name}`
            );
          }

          // Mark notification as sent
          await pool.query(
            `UPDATE products SET no_bid_notification_sent = TRUE WHERE id = $1`,
            [product.id]
          );
        } catch (error) {
          console.error(
            `[Auction] ❌ Failed to notify seller for product ${product.id}:`,
            error
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "[Auction] Failed to notify sellers of no-bid auctions:",
      error
    );
  }
};

/**
 * Start the auction status CronJob
 * Runs every 15 seconds to:
 * 1. Activate upcoming auctions
 * 2. End expired active auctions
 * 3. Send notifications for expired auctions with orders
 * 4. Notify sellers of auctions with no bids
 */
export const startAuctionCron = () => {
  cron.schedule("*/15 * * * * *", async () => {
    await activateUpcomingAuctions();
    await endExpiredAuctions(); // NEW: End active auctions
    await processExpiredAuctions();
    await notifySellersOfNoBidAuctions(); // NEW: Notify sellers of no-bid auctions
  });

  console.log("✅ Auction Status CronJob started (runs every 15 seconds)");
};
