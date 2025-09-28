// this file is for making connection with the db  



import mongoose from "mongoose";

let isConnected = false; // track connection

export async function connectDB() {
 

  try {
    await mongoose.connect(process.env.ATLAS_DB_URL);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

