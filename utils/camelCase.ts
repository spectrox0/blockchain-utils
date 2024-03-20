import camelcaseKeys from "camelcase-keys";

export const camelCase = (body: Parameters<typeof camelcaseKeys>[0]) =>
  camelcaseKeys(body, { deep: true });
