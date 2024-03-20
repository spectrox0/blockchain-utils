import { AlchemyProvider } from "ethers";
import { alchemyTokens, ALCHEMY_NETWORKS } from "models";

export const getAlchemyProvider = (network: ALCHEMY_NETWORKS) => {
  return new AlchemyProvider(
    alchemyTokens[network as ALCHEMY_NETWORKS].name,
    alchemyTokens[network as ALCHEMY_NETWORKS].token
  );
};
