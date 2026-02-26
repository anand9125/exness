// import { initializeDatabase } from "./db/schema";
import Cors from "cors";
import { connectredis } from "./db/connectToRedis";
import express from "express";
import { getCandlesData } from "./router/candles";
import { userRouter } from "./router/userRouter";
import { orderRouter } from "./router/orderRouter";
import { userMiddleware } from "./middleware/userMiddleware";

const app = express();
app.use(express.json());

// Explicit CORS configuration for web + local dev
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://exness.anandchaudhary.com",
];

app.use(
  Cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow non-browser clients like curl/postman
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Simple health-check endpoint (GET) to verify server + CORS
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/candles", getCandlesData);

app.use("/api/v1/user", userRouter);

app.use("/api/v1/order", userMiddleware, orderRouter);

(async () => {
  await connectredis();
  const port = parseInt(process.env.PORT || "4000", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
})();