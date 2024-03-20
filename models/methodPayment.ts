import { DeflyIcon } from "@atoms/icons/Defly";
import { MetamaskIcon, PeraWalletIcon, WalletConnectIcon } from "@atoms/icons";
import { Icon } from "@atoms/icons/types";
import { NETWORK_NAME } from "./network";

export const enum METHODS_PAYMENT {
  "WALLET_CONNECT" = "WALLET_CONNECT",
  "METAMASK" = "METAMASK",
  "PERA_WALLET" = "PERA_WALLET",
  "DEFLY_WALLET" = "DEFLY_WALLET",
}
export const METHOD_PAYMENTS = {
  [NETWORK_NAME.algorand]: [
    METHODS_PAYMENT.WALLET_CONNECT,
    METHODS_PAYMENT.PERA_WALLET,
    METHODS_PAYMENT.DEFLY_WALLET,
  ],
  [NETWORK_NAME.polygon]: [
    METHODS_PAYMENT.METAMASK,
    METHODS_PAYMENT.WALLET_CONNECT,
  ],
} as const;

export const IconMethods: Record<METHODS_PAYMENT, Icon> = {
  [METHODS_PAYMENT.DEFLY_WALLET]: DeflyIcon,
  [METHODS_PAYMENT.PERA_WALLET]: PeraWalletIcon,
  [METHODS_PAYMENT.METAMASK]: MetamaskIcon,
  [METHODS_PAYMENT.WALLET_CONNECT]: WalletConnectIcon,
};
export const MethodsName: Record<METHODS_PAYMENT, string> = {
  [METHODS_PAYMENT.DEFLY_WALLET]: "Defly Wallet",
  [METHODS_PAYMENT.PERA_WALLET]: "Pera Wallet",
  [METHODS_PAYMENT.METAMASK]: "Metamask",
  [METHODS_PAYMENT.WALLET_CONNECT]: "Wallet Connect",
};
