"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  type DeepPartial,
  type ChartOptions,
  type UTCTimestamp,
} from "lightweight-charts";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";
import useSocket from "@/hooks/useSocket";  
import { DecimalsMap, SUPPORTED_MARKETS } from "@repo/common";
import { useSession } from "next-auth/react";

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  trades?: number;
};


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

const TradingViewChart = ({
  symbol,
  interval,
}: {
  symbol: string;
  interval: string;
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket(symbol);
  const lastCandleRef = useRef<Candle | null>(null);
  const candlestickSeriesRef = useRef<any | null>(null);
  // const [assetPrices, setAssetPrices] = useState<Record<string, IPriceData>>(
  //   {}
  // );
  const [balance, setBalance] = useState(0);
  const { data } = useSession();

  const fetchUserBalance = async () => {
    if(!data?.accessToken) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/balance`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      const balance = res.data.usd_balance / 10 ** DecimalsMap["USDT"]
      setBalance(balance);
    } catch (error: any) {
      toast.error(error.response.data.message ?? error.message);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/candles?symbol=${symbol.toUpperCase()}&interval=${interval}`
      );

      return response.data
        .filter(
          (candle: any) =>
            candle.open != null &&
            candle.high != null &&
            candle.low != null &&
            candle.close != null
        )
        .map((candle: any) => ({
          time: Math.floor(new Date(candle.bucket).getTime() / 1000),
          open: Number(candle.open) / 10 ** candle.decimal,
          high: Number(candle.high) / 10 ** candle.decimal,
          low: Number(candle.low) / 10 ** candle.decimal,
          close: Number(candle.close) / 10 ** candle.decimal,
        }));
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

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.onmessage = ({ data }) => {
      const payload = JSON.parse(data.toString());
      const { buyPrice, sellPrice, timestamp, price, decimal } = payload.data;

      switch (payload.type) {
        case "PRICE_UPDATE": {
          if (payload.data.symbol === symbol) {
            processTick(price, timestamp, decimal);
          }
          // setAssetPrices((prev) => ({
          //   ...prev,
          //   [payload.data.symbol]: {
          //     buyPrice: buyPrice,
          //     sellPrice: sellPrice,
          //     price: price,
          //     symbol: payload.data.symbol,
          //     timestamp: timestamp,
          //     decimal,
          //   },
          // }));
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
      height: 400,
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
          height: 400,
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
    fetchUserBalance();
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 bg-background gap-6 items-start">
      <section aria-label="Live quote" className="md:col-span-1">
        <div className="rounded-md border">
          <div className="p-4">
            <h2 className="text-sm font-medium text-muted-foreground text-balance">
              {symbol?.toUpperCase()} Quote
            </h2>
          </div>
          {/* <div className="border-t">
            <table className="w-full text-sm">
              <caption className="sr-only">
                {"Live quote for "}
                {symbol?.toUpperCase()}
              </caption>
              <thead className="text-xs text-muted-foreground">
                <tr className="text-left">
                  <th className="px-4 py-2 font-normal">Symbol</th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2 font-normal">Bid</th>
                  <th className="px-4 py-2 font-normal">Ask</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_MARKETS.map((m) => (
                  <tr key={m.name} className="border-t">
                    <td className="px-4 py-2">
                      {m.name?.toUpperCase()} / USDT
                    </td>
                    <td>
                      <img src={m.logo} />
                    </td>
                    <td className="px-4 py-2">
                      {assetPrices[m.symbol]?.buyPrice /
                        10 ** DecimalsMap[m.asset]}
                    </td>
                    <td className="px-4 py-2">
                      {assetPrices[m.symbol]?.sellPrice /
                        10 ** DecimalsMap[m.asset]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
          <div>Balance : {balance}</div>
        </div>
      </section>

      <section className="md:col-span-2">
        <div
          ref={chartRef}
          className="w-full h-[400px] rounded-md border"
          aria-label="Price chart"
        />
      </section>
    </div>
  );
};

export default TradingViewChart;
