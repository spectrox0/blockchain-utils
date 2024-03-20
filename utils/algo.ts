import { decodeAddress, encodeAddress } from "algosdk";

export const getPublicKeyByAddress = (address: string) =>
  decodeAddress(address).publicKey;

export const concatKey = (privateKey: Uint8Array, publicKey: Uint8Array) => {
  const result = new Uint8Array(64);
  result.set(privateKey);
  result.set(publicKey, privateKey.length);
  return result;
};

export const getAddressByPublicKey = (publicKey: Uint8Array) =>
  encodeAddress(publicKey);
