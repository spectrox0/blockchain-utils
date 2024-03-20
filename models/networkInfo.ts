import { Icon } from "@atoms/icons/types";
import { NETWORK } from "./networkEnv";
import { NETWORK_NAME } from "./network";
import { PAYMENT_UNITS } from "./paymentUnit";

export type NetworkInfo = Record<
  NETWORK_NAME,
  {
    seedLength: number[];
    Icon: Icon;
    unit: PAYMENT_UNITS;
    unitPayment: PAYMENT_UNITS;
    payment: boolean;
  } & Record<NETWORK, boolean>
>;
