import {
  AlgorandIcon,
  BitcoinIcon,
  EthereumIcon,
  PolygonIcon,
  SolanaIcon,
  UsdcIcon,
  VechainIcon,
} from "@atoms/icons";
import { NETWORK_NAME } from "./network";

export enum PAYMENT_UNITS {
  "ETH" = "ETH",
  "SOL" = "SOL",
  "BTC" = "BTC",
  "MATIC" = "MATIC",
  "ALGO" = "ALGO",
  "USDC" = "USDC",
  "VET" = "VET",
}
export const IconPayment = {
  [PAYMENT_UNITS.ALGO]: AlgorandIcon,
  [PAYMENT_UNITS.BTC]: BitcoinIcon,
  [PAYMENT_UNITS.ETH]: EthereumIcon,
  [PAYMENT_UNITS.MATIC]: PolygonIcon,
  [PAYMENT_UNITS.SOL]: SolanaIcon,
  [PAYMENT_UNITS.VET]: VechainIcon,
  [PAYMENT_UNITS.USDC]: UsdcIcon,
} as const;

export const AVAILABLE_PAYMENT_UNITS = {
  [NETWORK_NAME.ethereum]: [PAYMENT_UNITS.USDC, PAYMENT_UNITS.ETH],
  [NETWORK_NAME.polygon]: [PAYMENT_UNITS.USDC, PAYMENT_UNITS.MATIC],
  [NETWORK_NAME.algorand]: [PAYMENT_UNITS.USDC, PAYMENT_UNITS.ALGO],
  [NETWORK_NAME.solana]: [PAYMENT_UNITS.USDC, PAYMENT_UNITS.SOL],
  [NETWORK_NAME.vechain]: [PAYMENT_UNITS.VET],
  [NETWORK_NAME.bitcoin]: [PAYMENT_UNITS.BTC],
} as const;

export type AvailablePaymentUnit<
  T extends keyof typeof AVAILABLE_PAYMENT_UNITS
> = (typeof AVAILABLE_PAYMENT_UNITS)[T][number];
