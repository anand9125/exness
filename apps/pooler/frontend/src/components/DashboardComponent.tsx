"use client";

import { Card } from "@/components/ui/card";
import { DecimalsMap, SUPPORTED_MARKETS } from "@repo/common";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import InstrumentList from "./InstrumentList";
import {
  CandlestickSeries,
  type ChartOptions,
  createChart,
  type DeepPartial,
  type UTCTimestamp,
} from "lightweight-charts";
import { useSession } from "next-auth/react";
import useSocket from "@/hooks/useSocket";
import { BACKEND_URL } from "@/app/config";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "./ui/input";
import { X } from "lucide-react";

type IPosition = {
  id: string;
  margin: number;
  type: "BUY" | "SELL";
  userId: string;
  openPrice: number;
  closePrice: number | null;
  profitLoss: number | null;
  status: "OPEN" | "CLOSE";
  quantity: number;
  symbol: string;
  opendAt: Date;
  closedAt: Date;
  leverage: number;
};

type OrdersTab = "OPEN" | "CLOSE";
type OrderSide = "BUY" | "SELL";

const INTERVALS = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"] as const;
type Interval = (typeof INTERVALS)[number];

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  trades?: number;
};

interface IPriceData {
  buyPrice: number;
  sellPrice: number;
  symbol: string;
  price: number;
  timestamp: number;
  decimal: number;
}

const getIntervalSec = (interval: string) => {
  switch (interval) {
    case "1m": {
      return 60;
    }
    case "5m": {
      return 5 * 60;
    }
    case "15m": {
      return 15 * 60;
    }
    case "30m": {
      return 30 * 60;
    }
    case "1h": {
      return 60 * 60;
    }
    case "4h": {
      return 4 * 60 * 60;
    }
    case "1d": {
      return 24 * 60 * 60;
    }
    default: {
      return 0;
    }
  }
};

export default function DashboardComponent({ symbol }: { symbol: string }) {
  const [interval, setInterval] = useState<Interval>("1m");
  const [balance, setBalance] = useState(0);
  const [ordersTab, setOrdersTab] = useState<OrdersTab>("OPEN");
  const [orderSide, setOrderSide] = useState<OrderSide>("BUY");
  const [amount, setAmount] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(5);
  const [positions, setPositions] = useState<IPosition[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const lastCandleRef = useRef<Candle | null>(null);
  const candlestickSeriesRef = useRef<any | null>(null);
  const { data } = useSession();
  const { socket, isConnected } = useSocket(symbol);
  const [latestPrices, setLatestPrices] = useState<Record<string, IPriceData>>(
    {}
  );
  const [lockedBalance, setLockedBalance] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);

  const handleParsePrice = (symbol: string, price: number) => {
    const decimals = DecimalsMap[symbol];
    return price / 10 ** decimals;
  };

  const handleCalculateEquity = (
    positions: IPosition[],
    balance: number,
    lockedBalance: number
  ) => {
    let totalEquity: number = balance + lockedBalance;

    positions.forEach((pos) => {
      if (pos.status === "OPEN") {
        totalEquity += handleCalculatePNL(
          pos.type,
          pos.symbol,
          pos.openPrice,
          pos.quantity
        );
      }
    });

    return totalEquity.toFixed(2);
  };

  const handleCalculatePNL = (
    side: "BUY" | "SELL",
    symbol: string,
    price: number,
    quantity: number
  ) => {
    const latestPrice = latestPrices[symbol]?.price || 0;

    const decimal = DecimalsMap[symbol];
    let pnl;
    if (side === "BUY") {
      pnl = (latestPrice / 10 ** decimal - price / 10 ** decimal) * quantity;
    } else {
      pnl = (price / 10 ** decimal - latestPrice / 10 ** decimal) * quantity;
    }

    return Number(pnl.toFixed(decimal));
  };

  const fetchUserBalance = async () => {
    if (!data?.accessToken) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/balance`, {
        // headers: {
        //   Authorization: `Bearer ${data?.accessToken}`,
        // },
      });
      setBalance(handleParsePrice("USDT", res.data.usd_balance));
      setLockedBalance(handleParsePrice("USDT", res.data.locked_balance));
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    }
  };

  const fetchChartData = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/api/v1/candles?symbol=BTC&interval=1m&limit=100"
    );

    console.log(response.data);

  return response.data
    .filter(
      (candle: any) =>
        candle.open != null &&
        candle.high != null &&
        candle.low != null &&
        candle.close != null
    )
    .map((candle: any) => ({
      time: Math.floor(new Date(candle.bucket).getTime() / 1000), // unix timestamp
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close),
    }))
    .sort((a: any, b: any) => a.time - b.time); // 👈 ensures ascending order

  } catch (error: any) {
    toast.error(error.message || "Failed to fetch chart data");
    return [];
  }
};


  const processTick = (
    priceInt: number,
    timestamp: number,
    decimal: number
  ) => {
    const price = priceInt / 10 ** decimal;
    const time = Math.floor(timestamp / 1000);
    const interverSec = getIntervalSec(interval);

    const candleTime = Math.floor(time / interverSec) * interverSec;

    const lastCandle = lastCandleRef.current;
    if (!lastCandle || !candlestickSeriesRef.current) return;

    if (candleTime === lastCandle.time) {
      lastCandle.high = Math.max(lastCandle.high, price);
      lastCandle.low = Math.min(lastCandle.low, price);
      lastCandle.close = price;

      candlestickSeriesRef.current.update(lastCandle);
    } else {
      const newCandle: Candle = {
        time: candleTime as UTCTimestamp,
        open: price,
        high: price,
        low: price,
        close: price,
      };
      lastCandleRef.current = newCandle;
      candlestickSeriesRef.current.update(newCandle);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/trades/trade`,
        {
          takeProfit: takeProfit ? takeProfit : null,
          stopLoss: stopLoss ? stopLoss : null,
          leverage,
          margin: amount,
          asset: symbol.slice(0, -4),
          type: orderSide,
        },
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );

      // toast.success(res.data.message);
      toast.success(
        `${orderSide} order placed for ${amount || "0"} ${symbol.toUpperCase()} with ${leverage}x leverage`,
        { position: "top-center" }
      );
      fetchUserBalance();
      fetchPositions();
    } catch (error: any) {
      toast.error(error.response.data.message ?? error.message, {
        position: "top-center",
      });
    }
  };

  const fetchPositions = async () => {
    if (!data || !data.accessToken) return;
    try {
      let api;
      if (ordersTab === "OPEN") {
        api = `${BACKEND_URL}/api/trades/open`;
      } else {
        api = `${BACKEND_URL}/api/trades`;
      }

      const res = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      setPositions(res.data);
    } catch (error: any) {
      toast.error(error.response.data.message ?? error.message, {
        position: "top-center",
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/trades/trade/close/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      fetchUserBalance();
      fetchPositions();
      toast.success(res.data.message, { position: "top-center" });
    } catch (error: any) {
      toast.error(error.response.data.message ?? error.message, {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        textColor: "#e5e7eb",
        background: { color: "#0b0b0b" },
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
    };
    const chart = createChart(chartRef.current, chartOptions);

    chart.applyOptions({
      width: chartRef.current.clientWidth,
      height: 420,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      borderColor: "#404040",
    });

    candlestickSeriesRef.current = candlestickSeries;

    const loadData = async () => {
      const data = await fetchChartData();
      if (data.length > 0) {
        console.log(data,"this is the data");
        candlestickSeries.setData(data);
        lastCandleRef.current = data[data.length - 1];
        chart.timeScale().fitContent();
      }
    };

    loadData();

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr?.width) {
        chart.applyOptions({
          width: Math.floor(cr.width),
          height: 420,
        });
      }
    });
    ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      candlestickSeriesRef.current = null;
    };
  }, [symbol, interval]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.onmessage = ({ data }) => {
      const payload = JSON.parse(data.toString());
      const { timestamp, price, decimal } = payload.data;

      switch (payload.type) {
        case "PRICE_UPDATE": {
          if (payload.data.symbol === symbol) {
            processTick(price, timestamp, decimal);
          }
          setLatestPrices((prev) => ({
            ...prev,
            [payload.data.symbol.slice(0, -4)]: payload.data,
          }));
          break;
        }
        default:
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, [socket, symbol, isConnected]);

  useEffect(() => {
    fetchUserBalance();
  }, [data]);

  useEffect(() => {
    if (ordersTab) {
      fetchPositions();
    }
  }, [data, ordersTab]);

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <section aria-label="Markets" className="overflow-x-auto">
          <div className="flex items-center gap-2">
            {SUPPORTED_MARKETS.map((m) => (
              <Link
                key={m.name}
                href={`/trade/${m.symbol}`}
                className="group flex items-center justify-center rounded-xl border border-slate-800 bg-background transition-all px-4 py-2 shadow-sm hover:shadow"
              >
                <span className="text-slate-200 font-medium group-hover:text-amber-400">
                  {m.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <aside className="lg:col-span-3">
            <Card className="p-3">
              <h2 className="text-sm font-semibold mb-2">Instruments</h2>
              <div className="max-h-[520px] overflow-auto">
                <InstrumentList />
              </div>
            </Card>

            <Card className="mt-4 p-3">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="text-xl font-semibold">
                ${handleCalculateEquity(positions, balance, lockedBalance)}
              </div>
            </Card>
          </aside>

          <div className="lg:col-span-9 space-y-4">
            <Card className="p-3">
              <nav
                aria-label="Chart intervals"
                className="flex flex-wrap items-center gap-2"
              >
                {INTERVALS.map((iv) => {
                  const isActive = iv === interval;
                  return (
                    <Button
                      key={iv}
                      size="sm"
                      variant={isActive ? "default" : "secondary"}
                      className={
                        isActive
                          ? "bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md"
                      }
                      onClick={() => setInterval(iv)}
                      aria-pressed={isActive}
                      aria-label={`Set interval to ${iv}`}
                    >
                      {iv}
                    </Button>
                  );
                })}
              </nav>

              <div
                ref={chartRef}
                className="mt-3 w-full h-[420px] rounded-md border"
                aria-label="Price chart"
                role="img"
              />
            </Card>

            <Card className="p-4">
              <div
                role="tablist"
                aria-label="Order side"
                className="flex gap-2 mb-4"
              >
                <Button
                  role="tab"
                  aria-selected={orderSide === "BUY"}
                  onClick={() => setOrderSide("BUY")}
                  className={
                    orderSide === "BUY"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }
                >
                  Buy
                </Button>
                <Button
                  role="tab"
                  aria-selected={orderSide === "SELL"}
                  onClick={() => setOrderSide("SELL")}
                  className={
                    orderSide === "SELL"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }
                >
                  Sell
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium text-foreground"
                  >
                    Amount
                  </label>
                  <Input
                    id="amount"
                    placeholder="Enter amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.valueAsNumber)}
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="leverage"
                    className="text-sm font-medium text-foreground"
                  >
                    Leverage: <span className="font-semibold">{leverage}x</span>
                  </label>
                  <input
                    id="leverage"
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    aria-valuemin={1}
                    aria-valuemax={100}
                    aria-valuenow={leverage}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="takeProfit"
                    className="text-sm font-medium text-foreground"
                  >
                    Take Profit (optional)
                  </label>
                  <Input
                    id="takeProfit"
                    placeholder="Enter amount for take profit"
                    type="number"
                    onChange={(e) => setTakeProfit(e.target.valueAsNumber)}
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="stopLoss"
                    className="text-sm font-medium text-foreground"
                  >
                    Stop Loss (optional)
                  </label>
                  <Input
                    id="stopLoss"
                    placeholder="Enter amount for stop loss"
                    type="number"
                    onChange={(e) => setStopLoss(e.target.valueAsNumber)}
                  />
                </div>
              </div>

              <Button
                className={`mt-4 w-full ${
                  orderSide === "BUY"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={handlePlaceOrder}
                disabled={!isConnected}
                aria-disabled={!isConnected}
                aria-label={`Place ${orderSide} order`}
              >
                {orderSide === "BUY" ? "Place Buy" : "Place Sell"}
              </Button>
              {!isConnected && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Waiting for price feed connection...
                </p>
              )}
            </Card>

            <Card className="p-4">
              <div
                role="tablist"
                aria-label="Orders"
                className="flex gap-2 mb-4"
              >
                <Button
                  role="tab"
                  aria-selected={ordersTab === "OPEN"}
                  onClick={() => setOrdersTab("OPEN")}
                  className={
                    ordersTab === "OPEN"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }
                >
                  Open
                </Button>
                <Button
                  role="tab"
                  aria-selected={ordersTab === "CLOSE"}
                  onClick={() => setOrdersTab("CLOSE")}
                  className={
                    ordersTab === "CLOSE"
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }
                >
                  Close
                </Button>
              </div>

              {ordersTab === "OPEN" ? (
                <div className="text-sm gap-4 text-muted-foreground">
                  {positions && positions.length > 0 ? (
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Volume (USD)</th>
                          <th className="text-left p-2">Open Price</th>
                          <th className="text-left p-2">Current Price</th>
                          <th className="text-left p-2">Open Time</th>
                          <th className="text-left p-2">P/L USD</th>
                          <th className="text-left p-2">Cancel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((pos, index) => (
                          <tr key={pos.id} className="border-t">
                            <td className="p-2">{pos.symbol}</td>
                            <td className="p-2">{pos.type}</td>
                            <td className="p-2">
                              {handleParsePrice(
                                "USDT",
                                pos.leverage * pos.margin
                              )}
                            </td>
                            <td className="p-2">
                              {handleParsePrice(pos.symbol, pos.openPrice)}
                            </td>
                            <td className="p-2">
                              {handleParsePrice(
                                pos.symbol,
                                latestPrices[pos.symbol]?.price
                              )! || 0}
                            </td>{" "}
                            <td className="p-2">
                              {new Date(pos.opendAt).toLocaleString()}
                            </td>
                            <td
                              className={`p-2 ${
                                handleCalculatePNL(
                                  pos.type,
                                  pos.symbol,
                                  pos.openPrice,
                                  pos.quantity
                                ) > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {handleCalculatePNL(
                                pos.type,
                                pos.symbol,
                                pos.openPrice,
                                pos.quantity
                              )}
                            </td>{" "}
                            <td
                              onClick={() => handleCancelOrder(pos.id)}
                              className="p-2"
                            >
                              <X className="text-red-400 cursor-pointer" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No open orders yet.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm gap-4 text-muted-foreground">
                  {positions && positions.length > 0 ? (
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Volume (USD)</th>
                          <th className="text-left p-2">Open Price</th>
                          <th className="text-left p-2">Close Price</th>
                          <th className="text-left p-2">Open Time</th>
                          <th className="text-left p-2">Close Time</th>
                          <th className="text-left p-2">P/L USD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((pos, index) => (
                          <tr key={pos.id} className="border-t">
                            <td className="p-2">{pos.symbol}</td>
                            <td className="p-2">{pos.type}</td>
                            <td className="p-2">
                              {handleParsePrice(
                                "USDT",
                                pos.leverage * pos.margin
                              )}
                            </td>
                            <td className="p-2">
                              {handleParsePrice(pos.symbol, pos.openPrice)}
                            </td>
                            <td className="p-2">
                              {handleParsePrice(
                                pos.symbol,
                                pos.closePrice as number
                              )}
                            </td>
                            <td className="p-2">
                              {new Date(pos.opendAt).toLocaleString()}
                            </td>
                            <td className="p-2">
                              {new Date(pos.closedAt).toLocaleString()}
                            </td>
                            <td
                              className={`p-2 ${
                                Number(pos.profitLoss) > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {Number(pos.profitLoss).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No Close orders yet.
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
