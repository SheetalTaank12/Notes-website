import Purchase from "../models/purchase.js"; // adjust path if needed
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

// Google Drive setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const drive = google.drive({ version: "v3", auth });

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Only GET allowed" });
  }

  try {
    const { purchaseId, fileId } = req.query; // serverless APIs get params from query
    if (!purchaseId || !fileId) {
      return res.status(400).json({ success: false, message: "purchaseId and fileId are required" });
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase || !purchase.files.some(file => file.id === fileId)) {
      return res.status(403).json({ success: false, message: "Unauthorized or file not found" });
    }

    // Get file metadata (name)
    const file = await drive.files.get({ fileId, fields: "name" });
    const fileName = file.data.name;

    // Stream file
    const driveStream = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
    
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    driveStream.data.pipe(res);

  } catch (err) {
    console.error("Google Drive download error:", err);
    res.status(500).json({ success: false, message: "Error fetching file" });
  }
}
