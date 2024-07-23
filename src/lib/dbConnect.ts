import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

const dbName = "asteriskDB"; // Replace with your actual database name

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to Database");
    return;
  }

  try {
    const db = await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`);
    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to Database");
  } catch (error) {
    console.log("Error connecting to Database", error);
    process.exit(1);
  }
}

export default dbConnect;
