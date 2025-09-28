import Purchase from "../models/purchase.js"; // adjust path if needed
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const purchase = await Purchase.findOne({ email });
    if (purchase) {
      res.status(200).json({ purchased: true });
    } else {
      res.status(200).json({ purchased: false });
    }

  } catch (err) {
    console.error("Error checking purchase:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
