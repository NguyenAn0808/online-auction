import cron from "node-cron";
import pool from "../config/database.js";
import * as EmailService from "./emailService.js";
import ProductModel from "../models/product.model.js";
import User from "../models/User.js";
import Bid from "../models/Bid.js";

class CronService {
  static start() {
    // Run every minutes
    cron.schedule("* * * * *", async () => {
      console.log("⏰ Cron Job: Checking for ended auctions...");
      await this.processEndedAuctions();
    });
  }

  static async processEndedAuctions() {
    try {
      // Find active products whose end_time has passed
      const query = `
          SELECT id, name FROM products
          WHERE end_time <= NOW() AND status = 'active'
        `;
      const { rows: expiredProducts } = await pool.query(query);

      if (expiredProducts.length === 0) return;

      console.log(`Found ${expiredProducts.length} ended auctions.`);

      for (const product of expiredProducts) {
        await this.handleSingleProduct(product);
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  }

  static async handleSingleProduct(product) {
    try {
      // Close auction
      await ProductModel.update(product.id, { status: "ended" });

      // Get seller info
      const seller = await User.findById(product.seller_id);

      // Get winner info
      const winnerBidder = await Bid.getHighest(product.id);

      // If no sale
      if (!winnerBidder) {
        // Send email to seller about no sale
        if (seller?.email) {
          await EmailService.sendAuctionNoSaleNotification(
            seller.email,
            product.name
          );
        }
        return;
      }

      // If sale happened
      const winner = await User.findById(winnerBidder.bidder_id);

      // Send email to seller
      if (seller?.email) {
        await EmailService.sendAuctionEndedNotificationToSeller(
          seller.email,
          product.name,
          winner.username,
          winnerBidder.amount
        );
      }
      // Send email to winner
      if (winner?.email) {
        await EmailService.sendAuctionWinNotification(
          winner.email,
          product.name,
          winnerBidder.amount
        );
      }
    } catch (error) {
      console.error(`Error processing product ${product.id}:`, err);
    }
  }
}
