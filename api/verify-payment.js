import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Purchase from "../models/purchase.js"; // adjust path if needed
import nodemailer from "nodemailer";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const files = [
      { id: "1pEvkAkfUDmqZ-9SadNl0TR8_boRPDUtN", name: "Complete History Notes" },
      { id: "1NBF2TJqcx4EvNwtHGeWJP6kRsdO8rhMy", name: "Complete Geography Notes" },
      { id: "1vYqzaAXxf_ES1_2VUy-ERqvvyIGqKI6y", name: "Complete Economics Notes" },
      { id: "1Z8GMz3LReFKdnLp1u1O8k0NEmYzgqQv2", name: "Complete BCM Notes" },
      { id: "1VqoRpWxpLcWGJ3ATZsNj8la-Q367pSCP", name: "Complete Computer Notes" },
      { id: "1d_2Uql_6FfaMb3-C4liUmJjvDDC_FqS5", name: "Hindi Grammar Notes" },
      { id: "1qZzTujJ4PHX9R7Fh6ziknfjHnV94Wc4w", name: "Complete Polity Notes" },
      { id: "1KYqtGxjvHpGYh1kLyYaBukParaF8DJlD", name: "Complete Science Notes" },
      { id: "1MkY0V1K7Ogs4BOIE6lM5PE0_Jn3VjxH2", name: "English-Grammar Notes" },
      { id: "1PaJeeDcO5dHUtTqlhmz8AjPxJrdxFVAe", name: "Environment-Eco Notes" },
      { id: "12DPoz4NcY6Xmy4QIETOAJ6okXcud_4gm", name: "Haryana GK" },
      { id: "1007S0F0j8OR1dWTP0GEQ6s0UoqNxGnxm", name: "Haryana Police Notes" },
      { id: "1-qefjMhrDeqiFGxL-3wd59V2z1AuYDMW", name: "Maths Solved Papers" },
      { id: "1nTl7voQVQLZskoI4eOcQwPmgRxwIJwj1", name: "Reasoning Solved Problems" },
    ];

    const purchase = await Purchase.create({
      email,
      payment_id: razorpay_payment_id,
      razorpay_order_id,
      files,
      amount: 29900,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const downloadLinks = files.map(f => ({
      url: `${process.env.BASE_URL}/download/paid/${purchase._id}/${f.id}`,
      name: f.name,
    }));

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "✅ Your Premium Notes Purchase",
      html: `<h4>Congrats! You got Premium Study Material</h4>
             <p>Thanks for your purchase of ₹100!</p>
             <p>Download your notes anytime:</p>
             <ul>
               ${downloadLinks.map(l => `<li><a href="${l.url}">${l.name}</a></li>`).join("")}
             </ul>
             <h4>ALL THE BEST FOR YOUR EXAM!</h4>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Email error:", err);
      else console.log("Email sent:", info.response);
    });

    res.status(200).json({ success: true, files, purchaseId: purchase._id });

  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
