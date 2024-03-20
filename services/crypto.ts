import { paymentsClient } from "graphql/apolloClient";
import { AIRDROP } from "graphql/mutations/crypto";
import { InvokeModal } from "hooks/useModal";
import {
  AVAILABLE_PAYMENT_UNITS,
  AvailablePaymentUnit,
  NETWORK_NAME,
  PAYMENT_UNITS,
  paymentMethodsConfirmations,
  paymentMethodsDecimals,
  NETWORK,
} from "models";
import { BaseAssociateAccount } from "models/vencrypt";
import { receiver, createAssociateAccount } from "utils/crypto";
import { recoverAssociateAccount } from "utils/crypto/recoverAccount";

export interface CryptoServiceConstructor {
  network: NETWORK;
  invokeSignModal: InvokeModal<BaseAssociateAccount["sk"]>;
}
export const fundsAirdrop = (
  variables: {
    address: string;
    network: NETWORK_NAME;
    usdc: boolean;
  },
  headers: { Authorization: string }
) =>
  paymentsClient.mutate<{ airdrop: string }>({
    mutation: AIRDROP,
    variables,
    context: { headers },
  });
export abstract class CryptoService<
  T = unknown,
  const N extends NETWORK_NAME = NETWORK_NAME
> {
  protected readonly blockchain: N;

  protected readonly receiver: string;

  protected readonly network: NETWORK;

  protected readonly decimals: number;

  protected readonly confirmations: number;

  protected readonly invokeSignModal: CryptoServiceConstructor["invokeSignModal"];

  private readonly workerCreate?: Worker;

  private readonly workerRecovery?: Worker;

  constructor({
    network,
    blockchain,
    invokeSignModal,
  }: CryptoServiceConstructor & {
    blockchain: N;
  }) {
    this.blockchain = blockchain;
    this.invokeSignModal = invokeSignModal;
    this.receiver = receiver[blockchain as N];
    this.network = network;
    this.decimals = paymentMethodsDecimals[blockchain as N];
    this.confirmations = paymentMethodsConfirmations[blockchain as N];
    this.workerCreate =
      typeof window !== "undefined"
        ? new Worker(new URL("../utils/createWalletWorker.ts", import.meta.url))
        : undefined;

    this.workerRecovery =
      typeof window !== "undefined"
        ? new Worker(
            new URL("../utils/recoveryWalletWorker.ts", import.meta.url)
          )
        : undefined;
  }

  abstract getBalance: ({
    address,
  }: {
    address: string;
    paymentUnit?: AvailablePaymentUnit<N>;
  }) => Promise<number>;

  abstract getTransactionInfo: (txId: string) => Promise<T>;

  abstract getTransactionProgress: (txId: string) => Promise<number>;

  isValidPaymentUnit = (
    unit: PAYMENT_UNITS
  ): unit is AvailablePaymentUnit<N> => {
    return AVAILABLE_PAYMENT_UNITS[this.blockchain].includes(unit as never);
  };

  transactionProgress = async ({
    txId,
    intervalMs = 3000,
  }: {
    txId: string;
    intervalMs?: number;
  }) => {
    await new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const progress = await this.getTransactionProgress(txId);
          if (progress === 100) {
            clearInterval(interval);
            resolve();
          }
        } catch (e) {
          clearInterval(interval);
          reject(new Error("Error getting progress transaction"));
        }
      }, intervalMs);
    });
  };

  private getAccount = (sk?: Uint8Array) => {
    const { worker, fn } = sk
      ? { worker: this.workerRecovery, fn: recoverAssociateAccount }
      : { worker: this.workerCreate, fn: createAssociateAccount };
    return new Promise<BaseAssociateAccount>((resolve, reject) => {
      setTimeout(async () => {
        try {
          if (!worker || !window?.Worker) {
            const res = fn[`${this.blockchain}`]?.(sk as Uint8Array);
            resolve(res);
          } else {
            worker.onmessage = e => {
              if (e.data.account) resolve(e.data.account);
              else reject();
            };
            worker.postMessage({ network: this.blockchain, sk });
            worker.onerror = () => reject();
          }
        } catch {
          reject();
        }
      }, 0);
    });
  };

  createAccount = () => {
    return new Promise<BaseAssociateAccount>((resolve, reject) => {
      setTimeout(async () => {
        const res =
          createAssociateAccount[`${this.blockchain as NETWORK_NAME}`](); // this.getAccount();
        if (!res) reject();
        resolve(res);
      }, 0);
    });
  };

  recoverAccount = (sk: Uint8Array) =>
    new Promise<BaseAssociateAccount>((resolve, reject) => {
      setTimeout(async () => {
        const res =
          recoverAssociateAccount[`${this.blockchain as NETWORK_NAME}`]?.(sk);
        if (!res) reject();
        resolve(res);
      }, 0);
    });

  getFunds = async ({
    account,
    headers,
  }: {
    account: BaseAssociateAccount;
    headers: { Authorization: string };
  }) => {
    const { data } = await fundsAirdrop(
      {
        address: account.addr,
        network: this.blockchain,
        usdc: true,
      },
      headers
    );
    if (!data?.airdrop) throw new Error("Error getting funds");
    await this.transactionProgress({ txId: data.airdrop });
  };

  abstract transaction: (params: {
    account: BaseAssociateAccount;
    amount: number;
    to: string;
    unit: AvailablePaymentUnit<N>;
  }) => Promise<string>;

  handlePayment = async ({
    unit = AVAILABLE_PAYMENT_UNITS[this.blockchain][0],
    to,
    amount,
    account,
  }: {
    unit: AvailablePaymentUnit<N>;
    amount: number;
    to: string;
    account: BaseAssociateAccount;
  }) => {
    if (!this.isValidPaymentUnit(unit)) throw new Error("Invalid payment unit");
    const txId = await this.transaction({
      unit,
      amount,
      to,
      account,
    });
    await this.transactionProgress({ txId });
    return txId;
  };

  payAssociateAccount = async ({
    unit = AVAILABLE_PAYMENT_UNITS[this.blockchain][0],
    amount = 1,
    account,
  }: {
    unit?: AvailablePaymentUnit<N>;
    amount: number;
    account: BaseAssociateAccount;
  }) => {
    return this.handlePayment({ unit, account, amount, to: this.receiver });
  };
}
