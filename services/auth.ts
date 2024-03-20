import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { Account } from "algosdk";
import { apolloClient } from "../graphql/apolloClient";
import { LOGIN } from "../graphql/mutations/auth";
import { buildSignature } from "../utils/vencrypt";

export const loginRequest = async ({
  account,
  client = apolloClient,
}: {
  account: Account;
  client?: ApolloClient<NormalizedCacheObject>;
}): Promise<string | undefined> => {
  return (
    await client.mutate<{ login: string }>({
      mutation: LOGIN,
      variables: {
        addr: account.addr,
        signature: buildSignature(account.sk),
      },
    })
  ).data?.login;
};
