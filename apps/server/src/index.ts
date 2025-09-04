import { initializeDatabase } from "./db/schema"; 
import Cors from "cors";
import { connectredis } from "./db/connectToRedis";
import express from "express";
import { getCandlesData } from "./router/candles";
import { userRouter } from "./router/userRouter";
import { orderRouter } from "./router/orderRouter";


const app = express();
app.use(express.json());
app.use(Cors());


app.use("/api/v1/candles",getCandlesData);

app.use("/api/v1/user",userRouter);

app.use("/api/v1/order",orderRouter);



(async () => {
  await initializeDatabase();
  await connectredis();
//  await connectToredis()
  app.listen(4000, () => {
    console.log("Server running on port 3000");
  });
})();