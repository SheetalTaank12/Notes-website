import Purchase from "../models/purchase.js"; // adjust path if needed
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Only GET allowed" });
  }

  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const purchases = await Purchase.find({ email }).sort({ createdAt: -1 });
    res.status(200).json({ purchases });

  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
