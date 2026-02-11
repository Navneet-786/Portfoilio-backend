import mongoose from "mongoose";

let isConnected = false;

export const dbConnection = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_PERSONAL_PORTFOLIO",
    });

    isConnected = db.connections[0].readyState;
    console.log("Connected to database!");
  } catch (error) {
    console.log("DB connection error:", error);
    throw error;
  }
};
