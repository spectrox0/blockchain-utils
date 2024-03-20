import { SESSION, COUPON } from "graphql/queries";
import { CREATE_SESSION, UPDATE_SESSION } from "graphql/mutations";
import { apolloClient } from "graphql/apolloClient";
import { Session, VerificationError } from "models/kyc";
import { INCODE_LOGIN } from "graphql/queries/kyc";

export const createSessionRequest = async ({
  jwtToken,
  coupon,
}: {
  jwtToken: string;
  coupon?: string;
}): Promise<undefined | Session> =>
  (
    await apolloClient.mutate<{ createSession: Session }>({
      mutation: CREATE_SESSION,
      context: {
        headers: {
          // network,
          Authorization: `Bearer ${jwtToken}`,
        },
      },
      variables: {
        coupon,
      },
    })
  ).data?.createSession;

export const getSessionRequest = async ({
  jwtToken,
  incodeToken,
}: {
  jwtToken: string;
  incodeToken?: string;
}): Promise<undefined | Session> =>
  (
    await apolloClient.query<{ session: Session }>({
      query: SESSION,
      context: {
        headers: {
          // network,
          Authorization: `Bearer ${jwtToken}`,
          "Incode-Token": incodeToken,
        },
      },
    })
  ).data?.session;

export const validateCoupon = async ({
  coupon,
  jwtToken,
}: {
  coupon: string;
  jwtToken?: string;
}): Promise<boolean> =>
  (
    await apolloClient.query<{ coupon: boolean }>({
      query: COUPON,
      context: {
        headers: {
          // network,
          Authorization: `Bearer ${jwtToken}`,
        },
      },
      variables: {
        coupon,
      },
    })
  ).data.coupon;

export const updateSessionRequest = async ({
  jwtToken,
  errors,
}: {
  jwtToken: string;
  coupon?: string;
  errors: VerificationError[];
}): Promise<undefined | Session> =>
  (
    await apolloClient.mutate<{ updateSession: Session }>({
      mutation: UPDATE_SESSION,
      context: {
        headers: {
          // network,
          Authorization: `Bearer ${jwtToken}`,
        },
      },
      variables: {
        errors,
      },
    })
  ).data?.updateSession;

export const incodeLoginRequest = async ({
  jwtToken,
}: {
  jwtToken: string;
}): Promise<undefined | string> =>
  (
    await apolloClient.query<{ incodeLogin: string }>({
      query: INCODE_LOGIN,
      context: {
        headers: {
          // network,
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    })
  ).data?.incodeLogin;
