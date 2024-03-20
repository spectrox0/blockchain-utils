import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  RpcResponseAndContext,
  SignatureStatus,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
// import { config } from "../config";
import { contractAddress } from "utils/crypto";
import {
  NETWORK,
  NETWORK_NAME,
  PAYMENT_UNITS,
  paymentMethodsDecimals,
} from "models";
import { Clusters, PhantomProvider } from "models/solana";
import { CryptoService, CryptoServiceConstructor } from "./crypto";

declare global {
  interface Window {
    solana: PhantomProvider;
  }
}

type TransactionResponse = RpcResponseAndContext<SignatureStatus>;
export class SolanaService extends CryptoService<
  TransactionResponse,
  NETWORK_NAME.solana
> {
  public readonly solanaConnection: Connection;

  private readonly solanaReceiver: PublicKey;

  private readonly usdcProgramID: PublicKey;

  private readonly usdcTokenAddress: PublicKey;

  constructor({ network, invokeSignModal }: CryptoServiceConstructor) {
    super({ network, blockchain: NETWORK_NAME.solana, invokeSignModal });
    this.solanaConnection = new Connection(
      clusterApiUrl(Clusters[`${network}`])
    );
    this.usdcTokenAddress = new PublicKey(
      contractAddress[`${this.network}`][`${NETWORK_NAME.solana}`][
        PAYMENT_UNITS.USDC
      ]
    );
    this.usdcProgramID = new PublicKey(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    );
    this.solanaReceiver = new PublicKey(this.receiver);
  }

  getBalance: CryptoService<Transaction>["getBalance"] = async ({
    address,
    paymentUnit = PAYMENT_UNITS.SOL,
  }) => {
    const walletPublicKey = new PublicKey(address);
    if (paymentUnit === PAYMENT_UNITS.SOL)
      return (
        (await this.solanaConnection.getBalance(walletPublicKey)) /
        LAMPORTS_PER_SOL
      );

    const tokenAccounts =
      await this.solanaConnection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        {
          programId: this.usdcProgramID,
        }
      );
    const res = tokenAccounts.value.find(
      ({ account }) =>
        account.data.parsed.info.tokenAmount.uiAmountString &&
        account.data.parsed.info.tokenAmount.uiAmountString !== "0"
    );
    return res ? res.account.data.parsed.info.tokenAmount.uiAmountString : 0;
  };

  buildPaymentTransaction = async (
    buyerPublicKey: PublicKey,
    usdAmount: number,
    solPriceInUsd: number
  ): Promise<Transaction> => {
    let amountSol = (usdAmount / solPriceInUsd).toFixed(
      paymentMethodsDecimals[NETWORK_NAME.solana]
    );
    amountSol = (Number(amountSol) * LAMPORTS_PER_SOL).toFixed(0);

    const { blockhash } = await this.solanaConnection.getLatestBlockhash(
      "finalized"
    );

    const transaction = new Transaction();

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: buyerPublicKey,
        toPubkey: this.solanaReceiver,
        lamports: BigInt(amountSol),
      })
    );
    transaction.feePayer = buyerPublicKey;
    transaction.recentBlockhash = blockhash;

    return transaction;
  };

  createPaymentTransaction = async (
    buyerPublicKey: PublicKey,
    amountUsd: number,
    tokenAddress: PublicKey
  ): Promise<Transaction> => {
    // Get details about the USDC token
    const usdcMint = await getMint(this.solanaConnection, tokenAddress);

    // Get the buyer's USDC token account address
    const buyerUsdcAddress = await getAssociatedTokenAddress(
      tokenAddress,
      buyerPublicKey
    );

    const tokenAmount = await this.solanaConnection.getTokenAccountBalance(
      buyerUsdcAddress
    );

    if (tokenAmount?.value?.uiAmount && tokenAmount.value.uiAmount < amountUsd)
      throw new Error("Insufficient USDC balance");

    // Get the shop's USDC token account address
    const shopUsdcAddress = await getAssociatedTokenAddress(
      tokenAddress,
      this.solanaReceiver
    );

    const { blockhash } = await this.solanaConnection.getLatestBlockhash(
      "finalized"
    );

    const transaction = new Transaction().add(
      createTransferCheckedInstruction(
        buyerUsdcAddress, // source
        tokenAddress, // mint (token address)
        shopUsdcAddress, // destination
        buyerPublicKey, // owner of source address
        amountUsd * 10 ** usdcMint.decimals, // amount to transfer (in units of the USDC token)
        usdcMint.decimals // decimals of the USDC token
      )
    );
    transaction.feePayer = buyerPublicKey;
    transaction.recentBlockhash = blockhash;

    return transaction;
  };

  getAssociatedAccount = async (tokenAddress: PublicKey, keyPair: Keypair) => {
    return getOrCreateAssociatedTokenAccount(
      this.solanaConnection,
      keyPair,
      tokenAddress,
      keyPair.publicKey
    );
  };

  sendTransactionSol = async (
    usdAmount: number,
    solPriceInUsd: number
  ): Promise<{ txnId: string; sender: string }> => {
    if (window.solana.isConnected) await window.solana.disconnect();
    const { publicKey } = await window.solana.connect();
    const txn = await this.buildPaymentTransaction(
      publicKey,
      usdAmount,
      solPriceInUsd
    );
    const { signature } = await window.solana.signAndSendTransaction(txn);

    return {
      txnId: signature,
      sender: publicKey.toString(),
    };
  };

  sendTransaction = async (
    amount: number,
    tokenAddress: PublicKey
  ): Promise<{ txnId: string; sender: string }> => {
    if (window.solana.isConnected) await window.solana.disconnect();
    const { publicKey } = await window.solana.connect();
    const txn = await this.createPaymentTransaction(
      publicKey,
      amount,
      tokenAddress
    );
    const { signature } = await window.solana.signAndSendTransaction(txn);

    return {
      txnId: signature,
      sender: publicKey.toString(),
    };
  };

  getTransactionInfo: CryptoService<TransactionResponse>["getTransactionInfo"] =
    async txId => {
      const res = await this.solanaConnection.getSignatureStatus(txId);
      if (!res?.value)
        Promise.reject(new Error(`Error getting transaction info: ${txId}`));
      return res as TransactionResponse;
    };

  getTransactionProgress: CryptoService["getTransactionProgress"] =
    async txId => {
      const { value } = await this.getTransactionInfo(txId);
      const confirmations = value.confirmations ?? 0;
      const progress = (confirmations * 100) / this.confirmations;
      return progress > 100 || value.confirmationStatus === "confirmed"
        ? 100
        : progress;
    };

  createTokenAccount = (
    unit: keyof (typeof contractAddress)[NETWORK][NETWORK_NAME.solana]
  ) =>
    new PublicKey(
      contractAddress[`${this.network}`][`${NETWORK_NAME.solana}`][`${unit}`]
    );

  getFunds: CryptoService["getFunds"] = async ({ account }) => {
    const address = new PublicKey(account.addr);
    const tx = await this.solanaConnection.requestAirdrop(
      address,
      2 * LAMPORTS_PER_SOL
    );
    await new Promise((resolve, reject) => {
      this.solanaConnection.onSignature(
        tx,
        res => {
          if (res.err) reject(res.err);
          resolve(res);
        },
        "finalized"
      );
    });
    // const associatedAccount = await this.getAssociatedAccount(
    //   this.usdcTokenAddress,
    //   Keypair.fromSeed(account.sk)
    // ).catch(err =>

    //
    //
    // const { data } = await fundsAirdrop(
    //   {
    //     address: account.addr,
    //     network: this.blockchain,
    //     usdc: true,
    //   },
    //   headers
    // );
    // if (!data) throw new Error(`Could not get account`);
    // await this.transactionProgress({ txId: data.airdrop });
  };

  transaction: CryptoService<unknown, NETWORK_NAME.solana>["transaction"] =
    async ({ account, amount, to, unit: _unit = PAYMENT_UNITS.SOL }) => {
      await this.invokeSignModal(`Sign Transaction`);
      const walletKeyPair = Keypair.fromSeed(account.sk);
      const from = walletKeyPair.publicKey;
      const amountToSend = LAMPORTS_PER_SOL * amount;
      const receiverPublicKey = new PublicKey(to);
      const minBalance =
        await this.solanaConnection.getMinimumBalanceForRentExemption(0); // minimum balance required for an account
      const senderAccountInfo = await this.solanaConnection.getAccountInfo(
        from
      );
      const totalAmount = amountToSend + minBalance; // total amount required to complete the transaction
      if (!senderAccountInfo || senderAccountInfo.lamports < totalAmount) {
        throw new Error(
          "Sender account does not have enough balance to complete the transaction"
        );
      }
      const instructions = [
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: receiverPublicKey,
          lamports: amountToSend,
        }),
      ];
      const { blockhash } = await this.solanaConnection.getLatestBlockhash(
        "finalized"
      );
      const messageV0 = new TransactionMessage({
        payerKey: from,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();
      const transaction = new VersionedTransaction(messageV0);

      transaction.sign([walletKeyPair]);

      return this.solanaConnection.sendTransaction(transaction, {
        maxRetries: 5,
        skipPreflight: false,
      });
    };
}
