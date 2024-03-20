import { config } from "config";
import { ALCHEMY_NETWORKS, NETWORK, NETWORK_NAME, PAYMENT_UNITS } from "models";

export const contractAddress = Object.freeze({
  [NETWORK.testnet]: {
    [NETWORK_NAME.ethereum]: {
      [PAYMENT_UNITS.USDC]: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    },

    [NETWORK_NAME.polygon]: {
      [PAYMENT_UNITS.USDC]: "0x0fa8781a83e46826621b3bc094ea2a0212e71b23",
      [PAYMENT_UNITS.MATIC]: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    },
    [NETWORK_NAME.solana]: {
      [PAYMENT_UNITS.USDC]: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    },
  },
  [NETWORK.mainnet]: {
    [NETWORK_NAME.polygon]: {
      [PAYMENT_UNITS.USDC]: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      [PAYMENT_UNITS.MATIC]: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    },
    [NETWORK_NAME.ethereum]: {
      [PAYMENT_UNITS.USDC]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      [PAYMENT_UNITS.MATIC]: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    },
    [NETWORK_NAME.solana]: {
      [PAYMENT_UNITS.USDC]: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
  },
} as const satisfies Record<NETWORK, Record<NETWORK_NAME.ethereum | NETWORK_NAME.polygon | NETWORK_NAME.solana, Partial<Record<PAYMENT_UNITS.USDC | PAYMENT_UNITS.MATIC, string>>>>);

export const chainId: Record<
  NETWORK,
  Record<
    | NETWORK_NAME.ethereum
    | NETWORK_NAME.polygon
    | NETWORK_NAME.algorand
    | NETWORK_NAME.solana,
    number
  >
> = Object.freeze({
  [NETWORK.testnet]: {
    [NETWORK_NAME.ethereum]: 5, // GOERLI
    [NETWORK_NAME.polygon]: 80001, // MUMBAI
    [NETWORK_NAME.solana]: 111,
    [NETWORK_NAME.algorand]: 4160,
  },
  [NETWORK.mainnet]: {
    [NETWORK_NAME.ethereum]: 1,
    [NETWORK_NAME.polygon]: 137,
    [NETWORK_NAME.algorand]: 4160,
    [NETWORK_NAME.solana]: 101,
  },
});

export const receiver = Object.freeze({
  [NETWORK_NAME.ethereum]: config.ethereumPaymentsAddress,
  [NETWORK_NAME.polygon]: config.polygonPaymentsAddress,
  [NETWORK_NAME.algorand]: config.algorandPaymentsAddress,
  [NETWORK_NAME.vechain]: config.vechainPaymentsAddress,
  [NETWORK_NAME.solana]: config.solanaPaymentsAddress,
  [NETWORK_NAME.bitcoin]: "",
} satisfies Record<NETWORK_NAME, string>);

export const alchemyNetwork = Object.freeze({
  [NETWORK_NAME.ethereum]: {
    [NETWORK.mainnet]: ALCHEMY_NETWORKS.ethMainnet,
    [NETWORK.testnet]: ALCHEMY_NETWORKS.ethTestnet,
  },
  [NETWORK_NAME.polygon]: {
    [NETWORK.testnet]: ALCHEMY_NETWORKS.maticTestnet,
    [NETWORK.mainnet]: ALCHEMY_NETWORKS.maticMainnet,
  },
} satisfies Record<NETWORK_NAME.ethereum | NETWORK_NAME.polygon, Record<NETWORK, ALCHEMY_NETWORKS>>);
