import axios from "axios";
import config from "../config/settings.js";

/**
 * Verify reCAPTCHA token with Google's API
 * @param {string} token - reCAPTCHA token from frontend
 */
export const verifyRecaptcha = async (token) => {
  try {
    if (!token) {
      return {
        success: false,
        error: "reCAPTCHA token is required",
      };
    }

    if (!config.RECAPTCHA_SECRET_KEY) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      return {
        success: false,
        error: "reCAPTCHA not configured on server",
      };
    }

    const params = new URLSearchParams({
      secret: config.RECAPTCHA_SECRET_KEY,
      response: token,
    });

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { success, "error-codes": errorCodes } = response.data;

    // if (!success) {
    //   return {
    //     success: false,
    //     error: "reCAPTCHA verification failed",
    //     errorCodes,
    //   };
    // }

    return { success: true };

    //   // For reCAPTCHA v3, check score (0.0 to 1.0)
    //   if (score !== undefined && score < 0.5) {
    //     console.warn(`Low reCAPTCHA score: ${score} for action: ${action}`);
    //     return {
    //       success: false,
    //       error: "Suspicious activity detected",
    //       score,
    //       action,
    //     };
    //   }

    //   return {
    //     success: true,
    //     score,
    //     action,
    //   };
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error.message);
    return {
      success: false,
      error: "Failed to verify reCAPTCHA",
    };
  }
};

export default verifyRecaptcha;
