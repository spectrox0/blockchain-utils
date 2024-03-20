const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const formatNumberToCurrency = (price: number): string => {
  return formatCurrency.format(price);
};
