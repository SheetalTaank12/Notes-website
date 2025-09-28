// app.js - handles routes + free + paid (with Razorpay) downloads
const express = require("express");
const path = require("path");

const ejsMate = require("ejs-mate");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const Purchase = require("./models/purchase"); // import Purchase model
dotenv.config(); //dotenv.config() loads all environment variables from a .env file into process.env

const app = express();

// ---------- View Engine ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- Razorpay Instance ----------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------- ROUTES ----------

// Redirect root → /notes
app.get("/", (req, res) => res.redirect("/notes"));

// ---------- Pages with try-catch ----------
app.get("/notes", (req, res) => {
  try { res.render("index.ejs"); }
  catch (err) { console.error(err); res.status(500).send("Error loading page"); }
});

app.get("/notes/about", (req, res) => {
  try { res.render("about.ejs"); }
  catch (err) { console.error(err); res.status(500).send("Error loading page"); }
});

app.get("/notes/samplenotes", (req, res) => {
  try { res.render("notes.ejs"); }
  catch (err) { console.error(err); res.status(500).send("Error loading page"); }
});

app.get("/notes/offers", (req, res) => {
  try {
    res.render("offers.ejs", { RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading page");
  }
});

app.get("/notes/reviews", (req, res) => {
  try { res.render("reviews.ejs"); }
  catch (err) { console.error(err); res.status(500).send("Error loading page"); }
});

app.get("/notes/contact", (req, res) => {
  try { res.render("contact.ejs"); }
  catch (err) { console.error(err); res.status(500).send("Error loading page"); }
});

app.get("/notes/policy", (req, res) => {
  try { res.render("policy.ejs"); }
  catch (err) { console.error(err); res.status(500).send("Error loading page"); }
});


// Privacy Policy
app.get("/notes/privacy-policy", (req, res) => {
  try {
    res.render("privacy-policy.ejs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading page");
  }
});

// Terms & Conditions
app.get("/notes/terms-and-conditions", (req, res) => {
  try {
    res.render("terms-and-conditions.ejs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading page");
  }
});


app.get("/notes/free-pdf",(req,res)=>{

  try { res.render("freepdf.ejs"); }
  catch (err) { console.error(err); res.status(500).send("Error loading page"); }

});



// ---------- PAID PDFS ----------

// Step 1: Create order
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = { amount, currency: "INR", receipt: "receipt_" + Date.now() };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).send("Error creating order");
  }
});

// Step 2: Verify payment & store purchase with email
app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // const files = [
      //   "Complete history theory one linear.pdf",
      //   "complete geography.pdf",
      //   "eco complete.pdf",
      //   "Environment-Ecology.pdf",
      //   "complete polity.pdf",
      //   "haryana gk.pdf",
      //   "Complete Hindi Grammar.pdf",
      //   "english-grammer.pdf",
      //   "Reasoning Solved Problems.pdf",
      //   "Mathematics Complete Solved Problems.pdf",
      //   "Complete Science Notes.pdf",
      //   "Haryana Police Notes.pdf",
      //   "BCM Notes.pdf",
      //   "Complete Computer Notes.pdf",
      // ];




      const files = [
  {id: "1pEvkAkfUDmqZ-9SadNl0TR8_boRPDUtN", name: "Complete History Notes"},  // history
  {id: "1NBF2TJqcx4EvNwtHGeWJP6kRsdO8rhMy", name: "Complete Geography Notes"},  //geo
  {id: "1vYqzaAXxf_ES1_2VUy-ERqvvyIGqKI6y", name: "Complete Economics Notes"}, //eco
  {id: "1Z8GMz3LReFKdnLp1u1O8k0NEmYzgqQv2", name: "Complete BCM Notes"}, //bcm
  {id: "1VqoRpWxpLcWGJ3ATZsNj8la-Q367pSCP", name: "Complete Computer Notes"}, //computer
  {id: "1d_2Uql_6FfaMb3-C4liUmJjvDDC_FqS5", name: "Hindi Grammar Notes"}, //hindi gr
  {id: "1qZzTujJ4PHX9R7Fh6ziknfjHnV94Wc4w", name: "Complete Polity Notes"}, //polity
  {id: "1KYqtGxjvHpGYh1kLyYaBukParaF8DJlD", name: "Complete Science Notes"}, //science
  {id: "1MkY0V1K7Ogs4BOIE6lM5PE0_Jn3VjxH2", name: "English-Grammar Notes"}, //eng gr
  {id: "1PaJeeDcO5dHUtTqlhmz8AjPxJrdxFVAe", name: "Environment-Eco Notes"}, //env eco
  {id: "12DPoz4NcY6Xmy4QIETOAJ6okXcud_4gm", name: "Haryana GK "}, //haryana gk
  {id: "1007S0F0j8OR1dWTP0GEQ6s0UoqNxGnxm", name: "Haryana Police Notes"}, //haryana police
  {id: "1-qefjMhrDeqiFGxL-3wd59V2z1AuYDMW", name: "Maths Solved Papers"}, //maths
  {id: "1nTl7voQVQLZskoI4eOcQwPmgRxwIJwj1", name: "Reasoning Solved Problems"}, //reasoning
];


      // Store purchase in DB with email
      const purchase = await Purchase.create({
        email,
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        files,
        amount: 29900
      });

      // Send email receipt
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const downloadLinks = files.map(f => ({
  url: `${req.protocol}://${req.get("host")}/download/paid/${purchase._id}/${f.id}`,
  name: f.name
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
         <h4>ALL THE BEST FOR YOUR EXAM!</h4>
        `
};


      transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error("Email error:", err);
        else console.log("Email sent:", info.response);
      });

      res.json({ success: true, files, purchaseId: purchase._id });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }

  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).send("Internal server error");
  }
});


// Route to serve paid files securely
const { google } = require("googleapis");

// Load service account key
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// Serve file from Google Drive
app.get("/download/paid/:purchaseId/:fileId", async (req, res) => {
  try {
    const { purchaseId, fileId } = req.params;
    const purchase = await Purchase.findById(purchaseId);

    if (
  !purchase ||
  !purchase.files.some(file => file.id === fileId)
) {
  return res.status(403).send("Unauthorized or file not found.");
}


    // Get file metadata (to fetch filename)
    const file = await drive.files.get({ fileId, fields: "name" });
    const fileName = file.data.name;

    // Stream file to user
    const driveStream = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    driveStream.data.pipe(res);

  } catch (err) {
    console.error("Google Drive download error:", err);
    res.status(500).send("Error fetching file.");
  }
});






// Fetch purchases by email
app.get("/get-purchases", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const purchases = await Purchase.find({ email }).sort({ createdAt: -1 });
    res.json({ purchases });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ error: "Server error" });
  }
});



//check if email already exists in db
app.post("/check-purchase", async (req, res) => {
  const { email } = req.body;
  try {
    const purchase = await Purchase.findOne({ email: email });
    if (purchase) {
      res.json({ purchased: true });
    } else {
      res.json({ purchased: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


//wherever res.json is used it is sending data to the frontend where the specific routes are fetched




// Handle contact form submission
app.post("/send-message", async (req, res) => {
  try {
    const { name, email, phone, subject, message, "inquiry-type": inquiryType } = req.body;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS  // your App Password (not Gmail password)
      }
    });

    // Email content
    const mailOptions = {
      from: email,
      to: "aumtechsolutionofficial@gmail.com", // your receiving email
      subject: `📩 New Contact Form Message - ${subject || "No subject"}`,
      html: `
        <h3>You got a new inquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "N/A"}</p>
        <p><b>Inquiry Type:</b> ${inquiryType}</p>
        <p><b>Message:</b><br>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});



module.exports = app;





