/* eslint-disable no-restricted-globals */
import { NETWORK_NAME } from "models";
import { recoverAssociateAccount } from "utils/crypto";

self.onmessage = (
  e: MessageEvent<{ network: NETWORK_NAME; sk: Uint8Array }>
) => {
  // Do some computation with the data from the parent
  const { network, sk } = e.data;
  const result = recoverAssociateAccount[`${network}`]?.(sk);

  // Send the result back to the parent
  self.postMessage({ account: result });
};

export {};
