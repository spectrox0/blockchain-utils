export enum NETWORK_NAME {
  "vechain" = "VECHAIN",
  "ethereum" = "ETHEREUM",
  "solana" = "SOLANA",
  "bitcoin" = "BITCOIN",
  "polygon" = "POLYGON",
  "algorand" = "ALGORAND",
}

export const shortNetworkName = {
  [NETWORK_NAME.vechain]: "VET" as const,
  [NETWORK_NAME.ethereum]: "ETH" as const,
  [NETWORK_NAME.solana]: "SOL" as const,
  [NETWORK_NAME.bitcoin]: "BTC" as const,
  [NETWORK_NAME.polygon]: "MATI" as const,
  [NETWORK_NAME.algorand]: "ALGO" as const,
} satisfies Record<NETWORK_NAME, string>;

export const paymentMethodsDecimals = {
  [NETWORK_NAME.bitcoin]: 8,
  [NETWORK_NAME.ethereum]: 8,
  [NETWORK_NAME.algorand]: 6,
  [NETWORK_NAME.solana]: 6,
  [NETWORK_NAME.polygon]: 4,
  [NETWORK_NAME.vechain]: 4,
} as const;

export const paymentMethodsConfirmations = {
  [NETWORK_NAME.bitcoin]: 6,
  [NETWORK_NAME.ethereum]: 12,
  [NETWORK_NAME.vechain]: 12,
  [NETWORK_NAME.algorand]: 2,
  [NETWORK_NAME.solana]: 20,
  [NETWORK_NAME.polygon]: 100,
} as const;

export enum EXPLORER_CATEGORY {
  "transaction" = "TRANSACTION",
  "address" = "ADDRESS",
}
