import WebSocket from "ws";
import { Data } from "./type";
import {scalewebsocket} from "./router/router";
import { connectRedis } from "./connectionredis/connectredis";
const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
const SPREAD_CONSTANT = 0.005;

ws.on("open", () => {
  console.log("Connected to Binance");
});

connectRedis()
ws.on("message", (msg) => {
  const data:Data = JSON.parse(msg.toString());
  scalewebsocket(data)
});