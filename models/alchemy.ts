import { config } from "config";

export const enum ALCHEMY_NETWORK_NAME {
  "homestead" = "homestead",
  "goerli" = "goerli",
  "matic" = "matic",
  "maticmum" = "maticmum",
}

export const enum ALCHEMY_NETWORKS {
  "ethMainnet" = "ethMainnet",
  "ethTestnet" = "ethTestnet",
  "maticMainnet" = "maticMainnet",
  "maticTestnet" = "maticTestnet",
}

export const alchemyTokens = {
  ethMainnet: {
    name: ALCHEMY_NETWORK_NAME.homestead,
    token: config.ethereumMainnetToken,
  },
  ethTestnet: {
    name: ALCHEMY_NETWORK_NAME.goerli,
    token: config.ethereumGoerliToken,
  },
  maticMainnet: {
    name: ALCHEMY_NETWORK_NAME.matic,
    token: config.polygonMainnetToken,
  },
  maticTestnet: {
    name: ALCHEMY_NETWORK_NAME.maticmum,
    token: config.polygonTestnetToken,
  },
} satisfies Record<
  ALCHEMY_NETWORKS,
  {
    name: ALCHEMY_NETWORK_NAME;
    token: string;
  }
>;
