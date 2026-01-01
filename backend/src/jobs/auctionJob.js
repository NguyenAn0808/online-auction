import cron from "node-cron";
import pool from "../config/database.js";
import ProductModel from "../models/product.model.js";
import Bid from "../models/Bid.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import * as EmailService from "../services/emailService.js";

const finalizeAuction = async (product) => {
  try {
    const winner = await Bid.getHighest(product.id);

    if (winner) {
      // Get winner and seller details
      const winnerUser = await User.findById(winner.bidder_id);
      const sellerUser = await User.findById(product.seller_id);

      // Create order for winner
      await Order.create({
        productId: product.id,
        buyerId: winner.bidder_id,
        sellerId: product.seller_id,
        finalPrice: winner.amount,
        proofImage: "",
        address: "Pending winner input",
      });

      await ProductModel.update(product.id, { status: "ended" });

      // 4. Auction ends (with winner) - Send emails to seller and winner
      if (winnerUser?.email) {
        await EmailService.sendAuctionWinNotification(
          winnerUser.email,
          product.name,
          winner.amount,
          winnerUser.full_name
        );
      }

      if (sellerUser?.email) {
        await EmailService.sendAuctionEndedNotificationToSeller(
          sellerUser.email,
          product.name,
          winner.amount,
          winnerUser?.full_name || "Winner"
        );
      }

      console.log(
        `[Auction] Finalized auction ${product.id} - Winner: User ${winner.bidder_id}`
      );
    } else {
      // 3. Auction ends (no buyer) - Send email to seller
      const sellerUser = await User.findById(product.seller_id);
      await ProductModel.update(product.id, { status: "ended" });

      if (sellerUser?.email) {
        await EmailService.sendAuctionNoSaleNotification(
          sellerUser.email,
          product.name
        );
      }

      console.log(`[Auction] Finalized auction ${product.id} - No bids`);
    }
  } catch (error) {
    console.error(`[Auction] Error finalizing auction ${product.id}:`, error);
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
 * Process expired auctions
 * Runs every minute to check for auctions that have ended
 */
const processExpiredAuctions = async () => {
  try {
    const query = `
      SELECT * FROM products 
      WHERE status = 'active' AND end_time <= NOW()
    `;
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      console.log(
        `[Auction] Found ${result.rows.length} expired auction(s) to finalize`
      );
      for (const product of result.rows) {
        await finalizeAuction(product);
      }
    }
  } catch (error) {
    console.error("[Auction] Failed to process expired auctions:", error);
  }
};

/**
 * Start the auction status CronJob
 * Runs every minute to:
 * 1. Activate upcoming auctions
 * 2. Finalize expired auctions
 */
export const startAuctionCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("[Cron] Running auction status check...");

    // Activate upcoming auctions
    await activateUpcomingAuctions();

    // Process expired auctions
    await processExpiredAuctions();
  });

  console.log("✅ Auction Status CronJob scheduled (runs every minute)");
};
