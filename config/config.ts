import { NETWORK } from "models/networkEnv";
import { z } from "zod";

const ConfigParser = z.object({
  mainnetIndexerUrl: z.string(),
  mainnetIndexerToken: z.string(),
  mainnetIndexerPort: z.string(),
  mainnetAlgoExplorerUrl: z.string(),
  mainnetAlgodUrl: z.string(),
  mainnetAlgodPort: z.string(),
  mainnetAlgodToken: z.string(),
  mainnetDappId: z.number().default(0),
  mainnetVechainNode: z.string(),
  mainnetVechainExplorer: z.string(),

  // testnet
  testnetIndexerUrl: z.string(),
  testnetIndexerToken: z.string(),
  testnetIndexerPort: z.string().default(""),
  testnetAlgoExplorerUrl: z.string(),
  testnetAlgodUrl: z.string(),
  testnetAlgodPort: z.string().default(""),
  testnetAlgodToken: z.string(),
  testnetDappId: z.number().default(0),
  testnetVechainNode: z.string(),
  testnetVechainExplorer: z.string(),

  initialNetwork: z.enum([NETWORK.mainnet, NETWORK.testnet]),

  etherscanToken: z.string(),
  ethereumGoerliToken: z.string(),
  ethereumMainnetToken: z.string(),
  polygonMainnetToken: z.string(),
  polygonTestnetToken: z.string(),
  solanaPaymentsAddress: z.string(),
  ethereumPaymentsAddress: z.string(),
  polygonPaymentsAddress: z.string(),
  algorandPaymentsAddress: z.string(),
  vechainPaymentsAddress: z.string(),

  ipfsUrl: z.string(),
});

type Config = z.infer<typeof ConfigParser>;
export const config: Config = ConfigParser.parse({
  mainnetIndexerUrl: process.env.NEXT_PUBLIC_MAINNET_INDEXER_URL,
  mainnetIndexerToken: process.env.NEXT_PUBLIC_MAINNET_INDEXER_TOKEN as string,
  mainnetIndexerPort: process.env.NEXT_PUBLIC_MAINNET_INDEXER_PORT,
  mainnetAlgoExplorerUrl: process.env.NEXT_PUBLIC_MAINNET_ALGO_EXPLORER_URL,
  mainnetAlgodUrl: process.env.NEXT_PUBLIC_MAINNET_ALGOD_URL,
  mainnetAlgodPort: process.env.NEXT_PUBLIC_MAINNET_ALGOD_PORT,
  mainnetAlgodToken: process.env.NEXT_PUBLIC_MAINNET_ALGOD_TOKEN,
  mainnetDappId: Number(process.env.NEXT_PUBLIC_MAINNET_DAPP_ID),

  algorandPaymentsAddress: process.env.NEXT_PUBLIC_ALGORAND_PAYMENTS_ADDRESS,
  ethereumPaymentsAddress: process.env.NEXT_PUBLIC_ETHEREUM_PAYMENTS_ADDRESS,
  polygonPaymentsAddress: process.env.NEXT_PUBLIC_POLYGON_PAYMENTS_ADDRESS,
  solanaPaymentsAddress: process.env.NEXT_PUBLIC_SOLANA_PAYMENTS_ADDRESS,
  vechainPaymentsAddress: process.env.NEXT_PUBLIC_VECHAIN_PAYMENTS_ADDRESS,

  // testnet
  testnetIndexerUrl: process.env.NEXT_PUBLIC_TESTNET_INDEXER_URL,
  testnetIndexerToken: process.env.NEXT_PUBLIC_TESTNET_INDEXER_TOKEN,
  testnetIndexerPort: process.env.NEXT_PUBLIC_TESTNET_INDEXER_PORT,
  testnetAlgoExplorerUrl: process.env.NEXT_PUBLIC_TESTNET_ALGO_EXPLORER_URL,
  testnetAlgodUrl: process.env.NEXT_PUBLIC_TESTNET_ALGOD_URL,
  testnetAlgodPort: process.env.NEXT_PUBLIC_TESTNET_ALGOD_PORT,
  testnetAlgodToken: process.env.NEXT_PUBLIC_TESTNET_ALGOD_TOKEN,
  testnetDappId: Number(process.env.NEXT_PUBLIC_TESTNET_DAPP_ID),

  initialNetwork: process.env.NEXT_PUBLIC_INITIAL_NETWORK,

  etherscanToken: process.env.NEXT_PUBLIC_ETHERSCAN_TOKEN,
  ethereumGoerliToken: process.env.NEXT_PUBLIC_ETH_GOERLI_TOKEN,
  ethereumMainnetToken: process.env.NEXT_PUBLIC_ETH_MAINNET_TOKEN,
  polygonMainnetToken: process.env.NEXT_PUBLIC_POLYGON_MAINNET_TOKEN,
  polygonTestnetToken: process.env.NEXT_PUBLIC_POLYGON_TESTNET_TOKEN,

  mainnetVechainNode: process.env.NEXT_PUBLIC_MAINNET_VECHAIN_NODE,
  mainnetVechainExplorer: process.env.NEXT_PUBLIC_MAINNET_VECHAIN_EXPLORER,
  testnetVechainNode: process.env.NEXT_PUBLIC_TESTNET_VECHAIN_NODE,
  testnetVechainExplorer: process.env.NEXT_PUBLIC_TESTNET_VECHAIN_EXPLORER,

  ipfsUrl: process.env.NEXT_PUBLIC_IPFS_URL,
});
