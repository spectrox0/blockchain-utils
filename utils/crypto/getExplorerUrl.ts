import { NETWORK, NETWORK_NAME } from "models";
import { EXPLORER_CATEGORY } from "models/network";
import { explorerBaseUrl } from "models/explorer";

export const getExplorerUrl = ({
  category,
  content,
  networkName,
  network,
}: {
  category: EXPLORER_CATEGORY;
  content: string;
  network: NETWORK;
  networkName: NETWORK_NAME;
}): string => {
  return `${
    explorerBaseUrl[`${networkName}`][`${network}`][`${category}`]
  }${content}${
    networkName === NETWORK_NAME.solana && network === NETWORK.testnet
      ? "?cluster=devnet"
      : ""
  }`;
};
