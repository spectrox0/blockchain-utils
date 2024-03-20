import axios, { AxiosInstance } from "axios";
import { NETWORK_NAME, PAYMENT_UNITS } from "models";
import { BaseAssociateAccount } from "models/vencrypt";
import { CryptoService, CryptoServiceConstructor } from "./crypto";

interface Stats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}
const client = axios.create({
  baseURL: "https://btcscan.org/api/",
  timeout: 30000,
});
interface BalanceInfo {
  address: string;
  chain_stats: Stats;
  mempool_stats: Stats;
}

export const getBtcBalance = async (address: string) => {
  const { data } = await client.get<BalanceInfo>(`address/${address}`);
  return data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
};
export class BitcoinService extends CryptoService<unknown> {
  transaction!: (params: {
    account: BaseAssociateAccount;
    amount: number;
    to: string;
    unit: PAYMENT_UNITS;
  }) => Promise<string>;

  private readonly client: AxiosInstance;

  constructor({ network, invokeSignModal }: CryptoServiceConstructor) {
    super({ network, blockchain: NETWORK_NAME.bitcoin, invokeSignModal });
    this.client = client;
  }

  // eslint-disable-next-line class-methods-use-this
  getBalance: CryptoService<unknown>["getBalance"] = async ({ address }) => {
    return getBtcBalance(address);
  };

  // eslint-disable-next-line class-methods-use-this
  getTransactionInfo = async () => {
    return { test: "as" };
  };

  // eslint-disable-next-line class-methods-use-this
  getTransactionProgress = async () => {
    return 1212;
  };
}
