import { PAYMENT_UNITS } from "./paymentUnit";

export const CRYPTO_IDS = {
  "usd-coin": PAYMENT_UNITS.USDC,
  "matic-network": PAYMENT_UNITS.MATIC,
  bitcoin: PAYMENT_UNITS.BTC,
  solana: PAYMENT_UNITS.SOL,
  ethereum: PAYMENT_UNITS.ETH,
  algorand: PAYMENT_UNITS.ALGO,
  vechain: PAYMENT_UNITS.VET,
} as const;
