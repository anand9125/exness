import z from "zod";

export const SignupSchema = z.object({
  email: z.email({ error: "Valid Email Should Be Provided" }),
  password: z
    .string()
    .min(8, { message: "Password Should be at least of 6 characters" }),
});

export const SigninSchema = z.object({
  email: z.email({ error: "Valid Email Should Be Provided" }),
  password: z
    .string()
    .min(8, { message: "Password Should be at least of 6 characters" }),
});

export const OrderSchema = z.object({
  asset : z.string(),
  type : z.enum(["BUY", "SELL"], {error : "Invalid Type"}),
  margin : z.number().min(1, {error : "margin should be greater than 0"}),
  leverage : z.number().min(1, {error : "leverage should be greater than or equal to 1"}).max(100, {error : "Leverage cannot be more than 100"}),
  takeProfit : z.number().optional().nullable(),
  stopLoss : z.number().optional().nullable()
});

export const SUPPORTED_MARKETS = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    asset: "BTC",
    logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    color: "#F7931A",
  },
  {
    symbol: "ETHUSDT",
    asset: "ETH",
    name: "Ethereum",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    color: "#627EEA",
  },
  {
    symbol: "SOLUSDT",
    asset: "SOL",
    name: "Solana",
    logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    color: "#9945FF",
  },
];

export const DecimalsMap: Record<string, number> = {
  BTC: 2,
  ETH: 2,
  BNB: 3,
  SOL: 3,
  XRP: 4,
  ADA: 4,
  DOGE: 5,
  SHIB: 8,
  PEPE: 10,
  USDT: 2,
  DEFAULT: 6,
};
