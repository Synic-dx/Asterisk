import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

const dbName = "Asterisk";

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to Database");
    return;
  }

  try {
    const db = await mongoose.connect(`${process.env.MONGODB_URI}`);
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to Database");
  } catch (error) {
    console.log("Error connecting to Database", error);
    process.exit(1);
  }
}

export default dbConnect;
