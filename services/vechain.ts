import { Connex } from "@vechain/connex";
import { NETWORK } from "models";
import { SigningKey } from "ethers";
import { Framework } from "@vechain/connex-framework";
import { Driver, SimpleNet, SimpleWallet } from "@vechain/connex-driver";

import { config } from "../config";
import { NETWORK_NAME, paymentMethodsDecimals } from "../models/network";
import { CryptoService, CryptoServiceConstructor } from "./crypto";

export class VechainService extends CryptoService<
  Connex.Thor.Transaction | null,
  NETWORK_NAME.vechain
> {
  private readonly networkNode: SimpleNet;

  private readonly connex: Connex;

  private readonly vendor: Connex.Vendor;

  private readonly explorer: string;

  constructor({
    network,
    connex,
    vendor,
    invokeSignModal,
  }: CryptoServiceConstructor & { connex: Connex; vendor: Connex.Vendor }) {
    super({ network, blockchain: NETWORK_NAME.vechain, invokeSignModal });
    this.explorer =
      network === "testnet"
        ? config.testnetVechainExplorer
        : config.mainnetVechainExplorer;

    this.networkNode = new SimpleNet(
      network === "testnet"
        ? config.testnetVechainNode
        : config.mainnetVechainNode
    );
    this.connex = connex;
    this.vendor = vendor;
  }

  transaction: CryptoService<unknown, NETWORK_NAME.vechain>["transaction"] =
    async ({ account, amount, to, unit }) => {
      await this.invokeSignModal(`Sign Transaction`);
      const signingKey = new SigningKey(account.sk);
      const wallet = new SimpleWallet();
      wallet.import(signingKey.privateKey);
      const driver = await Driver.connect(this.networkNode, wallet);
      const connex = new Framework(driver);
      if (unit === "VET") {
        const { txid } = await connex.vendor
          .sign("tx", [
            {
              to,
              value: amount * 10 ** 18,
              data: "0x",
            },
          ])
          .request();
        return txid;
      }
      return "";
    };

  buildLinkVechainExplorer = (txId: string) =>
    `${this.explorer}/transactions/${txId}`;

  payUsingConnexV2 = async (
    amountUsd: number,
    priceVet: number
  ): Promise<string> => {
    const amountVet = Number(
      (amountUsd / priceVet).toFixed(
        paymentMethodsDecimals[NETWORK_NAME.vechain]
      )
    );
    const { txid } = await this.vendor
      .sign("tx", [
        {
          to: this.receiver,
          value: amountVet * 10 ** 18,
          data: "0x",
          comment: `Transfer ${amountVet} VET`,
        },
      ])
      .request();
    return txid;
  };

  payUsingConnexV1 = async (
    amountUsd: number,
    priceVet: number
  ): Promise<string> => {
    if (!window.connex) throw new Error("Sync1 / VeChainThor not detected");
    else {
      const amountVet = Number(
        (amountUsd / priceVet).toFixed(
          paymentMethodsDecimals[NETWORK_NAME.vechain]
        )
      );
      const { txid } = await window.connex.vendor.sign("tx").request([
        {
          to: this.receiver,
          value: `0x${(amountVet * 10 ** 18).toString(16)}`,
          data: "0x",
          comment: `Transfer ${amountVet} VET`,
        },
      ]);
      return txid;
    }
  };

  getBalance: CryptoService["getBalance"] = async ({ address }) => {
    const data = await this.connex.thor.account(address).get();
    return parseInt(data.balance, 16) / 10 ** 18;
  };

  getCurrentBlock = async () => (await this.connex.thor.ticker().next()).number;

  getTransactionInfo = async (
    txnId: string
  ): Promise<Connex.Thor.Transaction | null> =>
    this.connex.thor.transaction(txnId).get();

  awaitTxSent = async (txId: string, confirms = 6): Promise<boolean> => {
    if (confirms <= 0) {
      return false;
    }
    await this.connex.thor.ticker().next();
    const data = await this.connex.thor.transaction(txId).get();
    return !data ? this.awaitTxSent(txId, confirms - 1) : true;
  };

  getTransactionProgress = async (txId: string) => {
    const [currentBlock, data] = await Promise.all([
      this.getCurrentBlock(),
      this.getTransactionInfo(txId),
    ]);

    let confirmations = 0;

    if (data && data.meta) {
      confirmations = currentBlock - data.meta.blockNumber;
    }

    let progress = (confirmations * 100) / this.confirmations;

    if (progress > 100) {
      progress = 100;
    }
    return progress;
  };
}

export const vechainServiceBuilder = async (
  network: NETWORK,
  invokeSignModal: CryptoServiceConstructor["invokeSignModal"]
): Promise<VechainService | undefined> => {
  if (typeof window === "undefined") return undefined;
  const { Connex } = await import("@vechain/connex");
  const vechainNetwork = network === "testnet" ? "test" : "main";
  const node =
    network === NETWORK.testnet
      ? config.testnetVechainNode
      : config.mainnetVechainNode;
  const vendor = new Connex.Vendor(vechainNetwork);
  const connex = new Connex({
    network: vechainNetwork,
    node,
  });
  return new VechainService({ network, connex, vendor, invokeSignModal });
};
