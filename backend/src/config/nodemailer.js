import nodemailer from "nodemailer";
import config from "./settings.js";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export default transporter;
