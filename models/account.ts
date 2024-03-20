import { Icon } from "components/atoms/icons/types";
import { NETWORK_NAME } from "./network";
import { PAYMENT_UNITS } from "./paymentUnit";

export interface BaseAccount {
  balance: number;
  address: string;
  mnemonic: string;
  privateKey: string | Uint8Array;
  publicKey: string;
  network: NETWORK_NAME;
}

export interface ProtectedAccount {
  subscriptionEnd?: Date;
  icon?: Icon;
  balance: number;
  cryptoBalance: [PAYMENT_UNITS, { amount: number; usd: number }][];
  address: string;
  unitCryptoPayment?: PAYMENT_UNITS;
  network: NETWORK_NAME;
}
