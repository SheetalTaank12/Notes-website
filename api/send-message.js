import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  try {
    const { name, email, phone, subject, message, "inquiry-type": inquiryType } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: email,
      to: "aumtechsolutionofficial@gmail.com",
      subject: `📩 New Contact Form Message - ${subject || "No subject"}`,
      html: `
        <h3>You got a new inquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Inquiry Type:</b> ${inquiryType}</p>
        <p><b>Message:</b><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
}
