import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { DecimalsMap, SUPPORTED_MARKETS } from "@repo/common";

interface IPriceData {
  buyPrice: number;
  sellPrice: number;
  symbol: string;
  price: number;
  timestamp: number;
  decimal: number;
}

export default function InstrumentList() {
  const { socket, isConnected } = useSocket();
  const [assetPrices, setAssetPrices] = useState<Record<string, IPriceData>>(
    {}
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.onmessage = ({ data }) => {
      const payload = JSON.parse(data.toString());

      const { buyPrice, sellPrice, timestamp, decimal, price, symbol } =
        payload.data;

      switch (payload.type) {
        case "PRICE_UPDATE": {
          setAssetPrices((prev) => ({
            ...prev,
            [symbol]: {
              buyPrice: buyPrice,
              sellPrice: sellPrice,
              price: price,
              symbol: payload.data.symbol,
              timestamp: timestamp,
              decimal,
            },
          }));
          break;
        }
      }
    };

    return () => {
      socket.close();
    };
  }, [socket]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <Search />
        <Input placeholder="Search" />
      </div>

      <div>
        <div className="border-t">
          <table className="w-full text-sm">
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
                  <td className="px-4 py-2">{m.name?.toUpperCase()} / USDT</td>
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
        </div>
      </div>
    </div>
  );
}
