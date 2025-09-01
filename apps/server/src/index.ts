import { initializeDatabase } from "./db/schema"; 
import Cors from "cors";
import { connectredis } from "./db/connectToRedis";
import express, { Request, Response } from "express";
import { getCandlesData } from "./router/candles";
const app = express();
app.use(express.json());
app.use(Cors());
app.use("/api/v1",getCandlesData);
app.get("/api/v1/test", (req: Request, res: Response) => {
    res.send("Test works");
});



(async () => {
  await initializeDatabase();
  await connectredis();

  app.listen(4000, () => {
    console.log("Server running on port 3000");
  });
})();