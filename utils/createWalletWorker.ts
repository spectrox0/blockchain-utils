/* eslint-disable no-restricted-globals */
import { NETWORK_NAME } from "models";
import { createAssociateAccount } from "utils/crypto";

self.onmessage = (e: MessageEvent<{ network: NETWORK_NAME }>) => {
  // Do some computation with the data from the parent
  const { network } = e.data;
  const result = createAssociateAccount[`${network}`]?.();

  // Send the result back to the parent
  self.postMessage({ account: result });
};

export {};
