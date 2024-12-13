import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/your_database_name";
        await mongoose.connect(uri);
        console.log("MongoDB connected...");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit process on failure
    }
};

export default connectDB;
