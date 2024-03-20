import { Algodv2, Indexer } from "algosdk";
import { config } from "../config";
import { NETWORK } from "./networkEnv";

export interface AlgoInstance {
  algoClient: Algodv2;
  indexerClient: Indexer;
  dAppID: number;
}

export const dAppID: Record<NETWORK, number> = {
  [NETWORK.testnet]: config.testnetDappId,
  [NETWORK.mainnet]: config.mainnetDappId,
};

export const algod = {
  [NETWORK.testnet]: {
    indexerClient: new Indexer( // token
      config.testnetIndexerToken,
      config.testnetIndexerUrl,
      config.testnetIndexerPort
    ),
    algoClient: new Algodv2(
      config.testnetAlgodToken,
      config.testnetAlgodUrl,
      config.testnetAlgodPort
    ),
    dAppID: dAppID[NETWORK.testnet],
  },
  [NETWORK.mainnet]: {
    indexerClient: new Indexer( // token
      config.mainnetIndexerToken,
      config.mainnetIndexerUrl,
      config.mainnetIndexerPort
    ),
    algoClient: new Algodv2(
      config.mainnetAlgodToken,
      config.mainnetAlgodUrl,
      config.mainnetAlgodPort
    ),
    dAppID: dAppID[NETWORK.mainnet],
  },
} satisfies Record<NETWORK, AlgoInstance>;

export const usdcId: Record<NETWORK, number> = {
  [NETWORK.testnet]: 10458941,
  [NETWORK.mainnet]: 31566704,
};
