/**
 * CronJob Manager
 * Central file to initialize and manage all scheduled jobs
 */

import { startAuctionCron } from "./auctionJob.js";

/**
 * Initialize all CronJobs
 * Call this function when the server starts
 */
export const initializeCronJobs = () => {
  console.log("\n🚀 Initializing CronJobs...\n");

  try {
    // Start auction status monitoring (every minute)
    startAuctionCron();

    console.log("\n✅ All CronJobs initialized successfully\n");
  } catch (error) {
    console.error("\n❌ Failed to initialize CronJobs:", error);
    throw error;
  }
};

export default initializeCronJobs;
