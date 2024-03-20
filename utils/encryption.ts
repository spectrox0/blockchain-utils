import {
  crypto_box_seal_open as cryptoBoxSealOpen,
  crypto_box_seed_keypair as cryptoBoxSeedKeypair,
  crypto_sign_ed25519_sk_to_seed as cryptoSignEd25519SkToSeed,
} from "libsodium-wrappers-sumo";
import { v4 as uuidv4 } from "uuid";
import aes from "js-crypto-aes";
// @ts-ignore
import * as argon2 from "argon2-browser/dist/argon2-bundled.min";

export const vencryptDecrypt = async ({
  sk,
  msg,
}: {
  sk: Uint8Array;
  msg: string;
}) => {
  const { publicKey, privateKey } = cryptoBoxSeedKeypair(
    cryptoSignEd25519SkToSeed(sk)
  );
  return Buffer.from(
    cryptoBoxSealOpen(Buffer.from(msg, "base64"), publicKey, privateKey)
  ).toString();
};

const getKey = async (key: string, saltBuffer: Buffer) => {
  const { hash } = await argon2.hash({
    pass: Uint8Array.from(Buffer.from(key)),
    type: 2,
    salt: saltBuffer,
    hashLen: 32,
  });
  return hash;
};

export const encryptData = async (
  data: string,
  key: string
): Promise<string> => {
  const msg = new TextEncoder().encode(data);
  const saltBuffer = Buffer.from(uuidv4());
  const ivBuffer = saltBuffer.slice(0, 12);
  const secKey = await getKey(key, saltBuffer);
  const encrypted = await aes.encrypt(msg, secKey, {
    name: "AES-GCM",
    iv: Uint8Array.from(ivBuffer),
    additionalData: undefined,
    tagLength: 16,
  });

  return `${saltBuffer.toString("hex")}:${Buffer.from(encrypted).toString(
    "hex"
  )}`;
};

export const decryptData = async (
  data: string,
  key: string
): Promise<string> => {
  const saltBuffer = Buffer.from(data.split(":")[0], "hex");
  const ivBuffer = saltBuffer.slice(0, 12);
  const msg = Uint8Array.from(Buffer.from(data.split(":")[1], "hex"));
  const secKey = await getKey(key, saltBuffer);
  const decrypted = await aes.decrypt(msg, secKey, {
    name: "AES-GCM",
    iv: Uint8Array.from(ivBuffer),
    additionalData: undefined,
    tagLength: 16,
  });
  return new TextDecoder().decode(decrypted);
};

export const encryptPassword = async (data: string): Promise<string> => {
  const saltBuffer = Buffer.from(uuidv4());
  const { encoded } = await argon2.hash({
    pass: Uint8Array.from(Buffer.from(data)),
    salt: saltBuffer,
    type: 2,
    hashLen: 32,
  });
  return encoded;
};
