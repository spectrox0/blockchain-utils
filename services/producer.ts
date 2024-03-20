import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { ProvisionResponse } from "models/kyc";
import { MERKLE_PROOF } from "graphql/queries/producer";
import { CommitData } from "models/vencrypt";
import { config } from "config";
import { authLink, producerClient } from "graphql/apolloClient";
import { PROVISION, COMMIT, ASSOCIATE } from "../graphql/mutations/producer";
import { loginRequest } from "./auth";

interface Constructor {
  token?: string;
  incodeToken?: string;
}
interface Payload {
  message: string;
  signature: string;
}

export class ProducerService {
  private readonly client: ApolloClient<NormalizedCacheObject>;

  private readonly headers: {
    Authorization?: string;
    "Incode-token"?: string;
  };

  constructor({ token, incodeToken }: Constructor) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Incode-token": incodeToken,
    };
    this.client = new ApolloClient<NormalizedCacheObject>({
      link: authLink.concat(
        new HttpLink({
          uri: config.producerUrl,
        })
      ),
      headers: this.headers,
      cache: new InMemoryCache(),
    });
  }

  provision = async ({
    message,
    signature,
  }: Payload): Promise<ProvisionResponse | undefined> => {
    return (
      await this.client.mutate<{ provision: ProvisionResponse }>({
        mutation: PROVISION,
        variables: {
          input: {
            message,
            signature,
          },
        },
        context: {
          headers: this.headers,
        },
      })
    )?.data?.provision;
  };

  commit = async ({
    message,
    signature,
  }: Payload): Promise<CommitData | undefined> => {
    return (
      await this.client.mutate<{ commit: CommitData }>({
        mutation: COMMIT,
        variables: {
          input: {
            message,
            signature,
          },
        },
        context: {
          headers: this.headers,
        },
      })
    ).data?.commit;
  };

  associate = async (
    { message, signature }: Payload,
    jwtToken: string
  ): Promise<CommitData | undefined> => {
    return (
      await this.client.mutate<{ associate: CommitData }>({
        mutation: ASSOCIATE,
        variables: {
          input: {
            message,
            signature,
          },
        },
        context: {
          // associate mutations uses a new jwt token for each associate
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      })
    ).data?.associate;
  };

  merkleProof = async (leaf: string) => {
    return (
      await this.client.query<{ merkleProof: string }>({
        query: MERKLE_PROOF,
        variables: {
          leaf,
        },
      })
    ).data;
  };
}
export const producerLoginRequest = async ({
  account,
}: Parameters<typeof loginRequest>[0]) =>
  loginRequest({ account, client: producerClient });
