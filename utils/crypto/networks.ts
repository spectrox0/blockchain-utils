import { NETWORK_NAME, NetworkInfo, PAYMENT_UNITS } from "models";

export const networks: NetworkInfo = Object.freeze({
  // change seedLength according to network
  [NETWORK_NAME.algorand]: {
    seedLength: Object.freeze([25]),
    unit: PAYMENT_UNITS.ALGO,
    unitPayment: PAYMENT_UNITS.USDC,
    testnet: true,
    mainnet: true,
  },
  [NETWORK_NAME.polygon]: {
    seedLength: Object.freeze([12]),
    unit: PAYMENT_UNITS.MATIC,
    unitPayment: PAYMENT_UNITS.USDC,
    testnet: true,
    mainnet: true,
  },
  [NETWORK_NAME.solana]: {
    seedLength: Object.freeze([12, 24]),
    unit: PAYMENT_UNITS.SOL,
    unitPayment: PAYMENT_UNITS.USDC,
    testnet: true,
    mainnet: true,
  },
  [NETWORK_NAME.vechain]: {
    seedLength: Object.freeze([12]),
    unit: PAYMENT_UNITS.VET,
    unitPayment: PAYMENT_UNITS.VET,
    testnet: true,
    mainnet: true,
  },
  [NETWORK_NAME.ethereum]: {
    seedLength: Object.freeze([12]),
    unit: PAYMENT_UNITS.ETH,
    unitPayment: PAYMENT_UNITS.USDC,
    testnet: true,
    mainnet: true,
  },

  [NETWORK_NAME.bitcoin]: {
    seedLength: Object.freeze([1, 6, 10, 12, 24]),
    unit: PAYMENT_UNITS.BTC,
    unitPayment: PAYMENT_UNITS.BTC,
    testnet: false,
    mainnet: true,
  },
});
