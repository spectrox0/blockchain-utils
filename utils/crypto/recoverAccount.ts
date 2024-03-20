import {
  generateAccount,
  mnemonicToSecretKey,
  secretKeyToMnemonic,
} from "algosdk";
import { Keypair } from "@solana/web3.js";
import { NETWORK_NAME } from "models";
import { BaseAssociateAccount } from "models/vencrypt";
import { SigningKey, ethers } from "ethers";

export type RecoverAccount<T = unknown> = (
  sk: Uint8Array
) => BaseAssociateAccount & T;

export const recoverAlgoAccount: RecoverAccount<
  ReturnType<typeof generateAccount>
> = (sk: Uint8Array) => {
  const mnemonic = secretKeyToMnemonic(sk);
  const account = mnemonicToSecretKey(mnemonic);
  return {
    addr: account.addr,
    mnemonic,
    network: NETWORK_NAME.algorand,
    sk: account.sk,
  };
};

export const recoverSolanaAccount: RecoverAccount = (sk: Uint8Array) => {
  const { secretKey, publicKey } = Keypair.fromSeed(sk.subarray(0, 32));
  return {
    addr: publicKey.toBase58(),
    network: NETWORK_NAME.solana,
    sk: secretKey.subarray(0, 32),
  };
};

export const recoverEthereumAccount = (
  sk: Uint8Array,
  network: NETWORK_NAME.ethereum | NETWORK_NAME.polygon | NETWORK_NAME.vechain
): BaseAssociateAccount => {
  const wallet = new ethers.Wallet(new SigningKey(sk));
  return {
    addr: wallet.address, // publicKey.toBase58(),
    network,
    sk,
  };
};

export const recoverBitcoinAccount: RecoverAccount = (sk: Uint8Array) => {
  return {
    addr: "", // publicKey.toBase58(),
    network: NETWORK_NAME.bitcoin,
    mnemonic: "",
    sk,
  };
};

export const recoverAssociateAccount = {
  [NETWORK_NAME.algorand]: recoverAlgoAccount,
  [NETWORK_NAME.bitcoin]: recoverBitcoinAccount,
  [NETWORK_NAME.ethereum]: sk =>
    recoverEthereumAccount(sk, NETWORK_NAME.ethereum),
  [NETWORK_NAME.solana]: recoverSolanaAccount,
  [NETWORK_NAME.polygon]: sk =>
    recoverEthereumAccount(sk, NETWORK_NAME.polygon),
  [NETWORK_NAME.vechain]: sk =>
    recoverEthereumAccount(sk, NETWORK_NAME.vechain),
} satisfies Record<NETWORK_NAME, RecoverAccount>;
