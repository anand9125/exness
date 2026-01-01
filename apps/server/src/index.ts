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
app.use(Cors());


app.use("/api/v1/candles",getCandlesData);

app.use("/api/v1/user",userRouter);

app.use("/api/v1/order", userMiddleware , orderRouter);



(async () => {
  await connectredis();
  app.listen(4000, () => {
    console.log("Server running on port 4000");
  });
})();