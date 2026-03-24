import mongoose from "mongoose";
import { config } from "../config/env.config";
export class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {}

  static get(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }

    return DatabaseConnection.instance;
  }
  async connect(): Promise<void>{
try {
    await mongoose.connect(config.MONGODB_URI);
console.log("Connected to MongoDB");


} catch (error) {
    
console.error("Error connecting to MongoDB:", error);
}
}

}
 export const connectDB = async (): Promise<void> => {
    await DatabaseConnection.get().connect();
};

export default DatabaseConnection;
