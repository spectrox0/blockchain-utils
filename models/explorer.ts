import { EXPLORER_CATEGORY, NETWORK_NAME } from "./network";
import { NETWORK } from "./networkEnv";

export const explorerBaseUrl = {
  [NETWORK_NAME.ethereum]: {
    [NETWORK.mainnet]: {
      [EXPLORER_CATEGORY.transaction]: "https://etherscan.io/tx/" as const,
      [EXPLORER_CATEGORY.address]: "https://etherscan.io/address/" as const,
    },
    [NETWORK.testnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://goerli.etherscan.io/tx/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://goerli.etherscan.io/address/" as const,
    },
  },

  [NETWORK_NAME.polygon]: {
    [NETWORK.testnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://mumbai.polygonscan.com/tx/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://mumbai.polygonscan.com/address/" as const,
    },
    [NETWORK.mainnet]: {
      [EXPLORER_CATEGORY.transaction]: "https://polygonscan.com/tx/" as const,
      [EXPLORER_CATEGORY.address]: "https://polygonscan.com/address/" as const,
    },
  },

  [NETWORK_NAME.solana]: {
    [NETWORK.mainnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://explorer.solana.com/tx/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://explorer.solana.com/address/" as const,
    },
    [NETWORK.testnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://explorer.solana.com/tx/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://explorer.solana.com/address/" as const,
    },
  },

  [NETWORK_NAME.algorand]: {
    [NETWORK.mainnet]: {
      [EXPLORER_CATEGORY.transaction]: "https://algoexplorer.io/tx/" as const,
      [EXPLORER_CATEGORY.address]: "https://algoexplorer.io/address/" as const,
    },
    [NETWORK.testnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://testnet.algoexplorer.io/tx/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://testnet.algoexplorer.io/address/" as const,
    },
  },

  [NETWORK_NAME.vechain]: {
    [NETWORK.mainnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://explore.vechain.org/transactions/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://explore.vechain.org/accounts/" as const,
    },
    [NETWORK.testnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://explore-testnet.vechain.org/transactions/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://explore-testnet.vechain.org/accounts/" as const,
    },
  },

  [NETWORK_NAME.bitcoin]: {
    [NETWORK.mainnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://www.blockchain.com/explorer/transactions/btc/" as const,

      [EXPLORER_CATEGORY.address]:
        "https://www.blockchain.com/explorer/addresses/btc/" as const,
    },
    [NETWORK.testnet]: {
      [EXPLORER_CATEGORY.transaction]:
        "https://blockstream.info/testnet/tx/" as const,
      [EXPLORER_CATEGORY.address]:
        "https://blockstream.info/testnet/address/" as const,
    },
  },
} satisfies Record<
  NETWORK_NAME,
  Record<NETWORK, Record<EXPLORER_CATEGORY, string>>
>;
