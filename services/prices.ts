import { PAYMENT_UNITS } from "models";
import { paymentsClient } from "graphql/apolloClient";
import { GET_PRICES } from "graphql/queries/prices";
import { PricesCrypto } from "../store/types";

export const getCryptoPrices = async (): Promise<PricesCrypto> => {
  const prices = {} as PricesCrypto;

  const { data } = await paymentsClient.query<{
    prices: { percentage: null | number; unit: PAYMENT_UNITS; value: number }[];
  }>({
    query: GET_PRICES,
    fetchPolicy: "no-cache",
    variables: {
      input: {
        percentage: true,
        units: Object.values(PAYMENT_UNITS),
      },
    },
  });
  if (data)
    data.prices.forEach(item => {
      prices[item.unit] = item.value;
    });

  return prices as PricesCrypto;
};
