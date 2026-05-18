import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Route imports
import eventRoutes from "./src/routes/eventRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

// Middleware imports
import { authenticate } from "./src/middleware/auth.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || "v1";

// ===== MIDDLEWARE =====
// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors());

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ===== API ROUTES =====
// Public routes (no authentication)
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// Protected event routes (require authentication)
// The authenticate middleware will be applied to all event routes
app.use(`/api/${API_VERSION}/events`, authenticate, eventRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

// ===== DATABASE CONNECTION =====
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/event-manager");
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// ===== START SERVER =====
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 API Version: ${API_VERSION}`);
        console.log(`🔗 Auth endpoints: http://localhost:${PORT}/api/${API_VERSION}/auth`);
        console.log(`📅 Event endpoints: http://localhost:${PORT}/api/${API_VERSION}/events`);
    });
};

startServer();

export default app;