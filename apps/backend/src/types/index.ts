import{ z} from "zod"
export const SignupSchema = z.object({
    username:z.string(),
    email:z.string(),
    password:z.string()
})

export const SigninSchema = z.object({
    email:z.string(),
    password:z.string()
})

export const JWT_PASSWORD = "Hii"

export const placeMarketOrderSchema = z.object({
  userId: z.number(),
  instrumentId: z.number(), //the base instrument
  quoteInstrumentId: z.number(), //the quote instrument
  side: z.enum(["Buy", "Sell"]), // assuming Side is either "buy" or "sell"
  volumeLot: z.union([z.string(), z.number()]),
  bid: z.union([z.string(), z.number()]),
  ask: z.union([z.string(), z.number()]),
});
