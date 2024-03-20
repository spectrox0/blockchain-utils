import { NETWORK_NAME, PAYMENT_UNITS } from "models";
import { config } from "../config";

export const getPaymentAddress = async (
  blockchain: NETWORK_NAME,
  unit: PAYMENT_UNITS
): Promise<string> => {
  if (!unit) throw new Error("Unit missing");
  else if (blockchain === NETWORK_NAME.algorand)
    return config.algorandPaymentsAddress;
  else if (blockchain === NETWORK_NAME.bitcoin)
    return "1NtP3sDgFCfWX4ofYG8x6Tt44fywVCLmMX";
  else if (blockchain === NETWORK_NAME.polygon)
    return config.polygonPaymentsAddress;
  else if (blockchain === NETWORK_NAME.solana)
    return config.solanaPaymentsAddress;
  else if (blockchain === NETWORK_NAME.vechain)
    return config.vechainPaymentsAddress;
  return config.ethereumPaymentsAddress;
};
