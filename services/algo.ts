import { TransactionResponse } from "@solana/web3.js";
import { MerkleProof } from "@vendible/vencrypt";
import {
  Algodv2,
  algosToMicroalgos,
  Indexer,
  isValidAddress,
  makeAssetTransferTxnWithSuggestedParams,
  makePaymentTxnWithSuggestedParams,
  Transaction,
  microalgosToAlgos,
  waitForConfirmation,
} from "algosdk";
import type {
  AccountResponse,
  Account,
} from "algosdk/dist/types/client/v2/indexer/models/types";
import { ProducerService } from "services/producer";
import { camelCase } from "utils/camelCase";
import { NETWORK_NAME, PAYMENT_UNITS } from "models";
import { config } from "config";
import { algod, usdcId } from "models/algo";
import {
  CryptoService,
  CryptoServiceConstructor,
  fundsAirdrop,
} from "./crypto";

const txnFee = 1000;

export const algoTransactionSign = (
  transaction: Transaction,
  sk: Uint8Array
): Uint8Array => {
  return transaction.signTxn(sk);
};

export class AlgoService extends CryptoService<
  TransactionResponse,
  NETWORK_NAME.algorand
> {
  private readonly client: Algodv2;

  private readonly indexer: Indexer;

  private readonly usdcId: number;

  constructor({ network, invokeSignModal }: CryptoServiceConstructor) {
    super({ network, blockchain: NETWORK_NAME.algorand, invokeSignModal });
    const { algoClient, indexerClient } = algod[`${network}`];
    this.client = algoClient;
    this.indexer = indexerClient;
    this.usdcId = usdcId[`${network}`];
  }

  buildUSDCTransaction = async ({
    from,
    amount,
    to,
  }: {
    from: string;
    amount: number;
    to: string;
  }): Promise<Transaction> => {
    const params = await this.client.getTransactionParams().do();
    if (!isValidAddress(from)) throw new Error("Invalid address");
    const enoughAlgoBalance = await this.checkAddressAlgoBalance(from, txnFee);
    if (!enoughAlgoBalance)
      throw new Error("Insufficient Algo Balance to pay transaction's fee");

    const userUsdcBalance = await this.getBalance({ address: from });

    if (userUsdcBalance < amount) throw new Error("Insufficient USDC Balance");

    return makeAssetTransferTxnWithSuggestedParams(
      from,
      to,
      undefined,
      undefined,
      amount * 10 ** 6,
      undefined,
      this.usdcId,
      params
    );
  };

  buildTransaction = async ({
    from,
    to,
    amount,
  }: {
    from: string;
    to: string;
    amount: number;
  }): Promise<Transaction> => {
    const amountAlgo = algosToMicroalgos(Number(amount.toFixed(this.decimals)));
    const params = await this.client.getTransactionParams().do();
    if (!isValidAddress(from)) throw new Error("Invalid address");
    const enoughAlgoBalance = await this.checkAddressAlgoBalance(
      from,
      amountAlgo + txnFee
    );
    if (!enoughAlgoBalance) throw new Error("Insufficient Algo Balance");
    return makePaymentTxnWithSuggestedParams(
      from,
      to,
      amountAlgo,
      undefined,
      undefined,
      params
    );
  };

  sendTransaction = async (txn: Uint8Array | Uint8Array[]): Promise<string> => {
    const { txId } = await this.client.sendRawTransaction(txn).do();
    return txId as string;
  };

  getTransactionInfo: CryptoService<TransactionResponse>["getTransactionInfo"] =
    async txnId =>
      (await this.indexer
        .lookupTransactionByID(txnId)
        .do()) as TransactionResponse;

  getTokenBalance = (account: Account, assetId: number = this.usdcId): number =>
    Number(
      account?.assets?.find?.(item => item.assetId === assetId)?.amount ?? 0
    ) /
    10 ** 6;

  getBalance: CryptoService<unknown, NETWORK_NAME.algorand>["getBalance"] =
    async ({ address, paymentUnit }) => {
      if (paymentUnit === PAYMENT_UNITS.ALGO)
        return this.getAlgoBalance({ address });
      const { account } = camelCase(
        await this.indexer.lookupAccountByID(address).do()
      ) as AccountResponse;
      return this.getTokenBalance(account);
    };

  checkAddressAlgoBalance = async (
    address: string,
    microalgosToPay: number
  ) => {
    const account = camelCase(
      await this.client.accountInformation(address).do()
    ) as Account & { minBalance: number };
    return (
      microalgosToPay < Number(account.amount) - Number(account.minBalance)
    );
  };

  getAlgoBalance = async ({ address }: { address: string }) => {
    const account = camelCase(
      await this.client.accountInformation(address).do()
    ) as Account;

    return microalgosToAlgos(Number(account.amount));
  };

  getTrustibleTxn = async ({
    address,
    txnId,
    producerService,
  }: {
    producerService: ProducerService;
    address?: string;
    txnId?: string;
  }): Promise<
    | {
        did?: {
          identifier: string;
          didId: string;
          txnId: string;
          merkleRoot: string;
          leaf: string;
          merkleProof: MerkleProof;
        };
        oldDid: boolean;
      }
    | undefined
  > => {
    let note: string | undefined;
    if (txnId) {
      // find did txn directly using txnID
      const { transaction } = await this.indexer
        .lookupTransactionByID(txnId)
        .do();

      note = transaction?.note.toString();
    } else {
      const { transactions } = await this.indexer
        .searchForTransactions()
        .address(config.mainAddress)
        .addressRole("sender")
        .notePrefix(
          Buffer.from(
            `${config.mainAccountNamespace}.addr:${address}`
          ).toString("base64")
        )
        .do();

      const { transactions: oldTransactions } = await this.indexer
        .searchForTransactions()
        .address(config.mainAddress)
        .addressRole("sender")
        .notePrefix(Buffer.from(`trustible:${address}`).toString("base64"))
        .do();

      // for simulating old did account
      // if (!oldTransactions.length && transactions.length) {
      if (oldTransactions.length && !transactions.length) {
        // if only the old did tx is found return boolean to recreate it
        // and no need to keep going
        return { oldDid: true };
      }

      if (transactions?.length && transactions[0]) {
        note = transactions[0]?.note.toString();
        txnId = transactions[0].id;
      }
    }
    if (!note || !txnId) return undefined;

    note = Buffer.from(note, "base64").toString("utf-8");
    const [identifier, _addr, tpkJubJubB64, didId, merkleRoot] = note
      .split(":")
      .slice(1);

    const { merkleProof } = await producerService.merkleProof(tpkJubJubB64);
    return {
      did: {
        identifier,
        didId,
        txnId,
        merkleRoot,
        leaf: tpkJubJubB64,
        merkleProof: JSON.parse(merkleProof),
      },
      oldDid: false,
    };
  };

  optInUsdc = async ({ addr }: { addr: string }): Promise<Transaction> => {
    const enoughAlgoBalance = await this.checkAddressAlgoBalance(
      addr,
      txnFee + 100000
    );
    if (!enoughAlgoBalance)
      throw new Error("Insufficient Algo Balance to pay transaction's fee");
    const transactionParams = await this.client.getTransactionParams().do();
    return makeAssetTransferTxnWithSuggestedParams(
      addr,
      addr,
      undefined,
      undefined,
      0,
      undefined,
      this.usdcId,
      transactionParams
    );
  };

  getTransactionProgress: CryptoService["getTransactionProgress"] =
    async txId => {
      const res = await this.getTransactionInfo(txId);
      const confirmations =
        // @ts-ignore
        res["current-round"] - res.transaction["confirmed-round"];
      const value = (confirmations * 100) / this.confirmations;
      return Math.min(value, 100);
    };

  getFunds: CryptoService["getFunds"] = async ({ account, headers }) => {
    const res = await fundsAirdrop(
      {
        address: account.addr,
        network: this.blockchain,
        usdc: false,
      },
      headers
    );
    if (!res?.data?.airdrop) throw new Error(`Failed to create account`);
    await this.transactionProgress({ txId: res.data.airdrop });
    const transaction = await this.optInUsdc({
      addr: account.addr,
    });
    // await this.invokeSignModal("Sign Opt in USDC");
    const txn = algoTransactionSign(transaction, account.sk);
    const txID = await this.sendTransaction(txn);

    await waitForConfirmation(this.client, txID, 2);
    await this.transactionProgress({ txId: transaction.txID() });
    const airdrop = await fundsAirdrop(
      {
        address: account.addr,
        network: this.blockchain,
        usdc: true,
      },
      headers
    );
    if (!airdrop?.data?.airdrop) throw new Error(`Failed to create account`);
    await this.transactionProgress({ txId: airdrop.data.airdrop });
  };

  transaction: CryptoService<unknown, NETWORK_NAME.algorand>["transaction"] =
    async ({ to, amount, unit, account }) => {
      const transaction = await this[
        unit === PAYMENT_UNITS.USDC
          ? "buildUSDCTransaction"
          : "buildTransaction"
      ]({
        from: account.addr,
        amount,
        to,
      });

      await this.invokeSignModal(`Sign Transaction`);
      const txn = algoTransactionSign(transaction, account.sk);
      const txID = await this.sendTransaction(txn);
      await waitForConfirmation(this.client, txID, 2);
      await this.transactionProgress({ txId: txID });
      return txID;
    };
}
