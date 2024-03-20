import WalletConnectProvider from "@walletconnect/web3-provider";
import {
  Contract,
  AlchemyProvider,
  ethers,
  TransactionResponse,
  BrowserProvider,
  Eip1193Provider,
  TransactionReceipt,
  Wallet,
  SigningKey,
  ContractRunner,
  parseUnits,
  formatEther,
} from "ethers";
import { ABI_ERC20 } from "utils/ABI_ERC20";
import {
  contractAddress,
  alchemyNetwork,
  chainId,
  networks,
  getAlchemyProvider,
} from "utils/crypto";
import { AvailablePaymentUnit, NETWORK_NAME, PAYMENT_UNITS } from "models";
import { CryptoService, CryptoServiceConstructor } from "./crypto";

declare global {
  interface Window {
    ethereum: Eip1193Provider;
  }
}

interface TxnParam {
  to: string;
  from: string;
  value: string;
}

type Blockchain = NETWORK_NAME.ethereum | NETWORK_NAME.polygon;

interface EthersConstructor extends CryptoServiceConstructor {
  blockchain: Blockchain;
}
export class EthersService extends CryptoService<
  TransactionResponse,
  NETWORK_NAME.ethereum | NETWORK_NAME.polygon
> {
  private readonly chainId: string;

  private readonly provider: AlchemyProvider;

  constructor({ network, blockchain, invokeSignModal }: EthersConstructor) {
    super({ network, blockchain, invokeSignModal });
    this.provider = getAlchemyProvider(
      alchemyNetwork[`${blockchain}`][`${network}`]
    );
    this.chainId = chainId[`${network}`][`${blockchain}`].toString(16);
  }

  getContractAddress = (
    unit: AvailablePaymentUnit<
      NETWORK_NAME.ethereum | NETWORK_NAME.polygon
    > = PAYMENT_UNITS.USDC
  ) => {
    if (!this.isValidPaymentUnit(unit)) throw new Error(`Invalid payment unit`);
    const address = contractAddress[`${this.network}`][
      `${this.blockchain as EthersConstructor["blockchain"]}`
    ][unit as PAYMENT_UNITS.USDC] as string;
    if (!address) throw new Error(`Invalid payment unit`);
    return address;
  };

  getContract = (
    unit: Exclude<
      AvailablePaymentUnit<NETWORK_NAME.ethereum | NETWORK_NAME.polygon>,
      PAYMENT_UNITS.ETH
    > = PAYMENT_UNITS.USDC,
    contract: ContractRunner | null | undefined = this.provider
  ) => {
    return new Contract(this.getContractAddress(unit), ABI_ERC20, contract);
  };

  getCryptoBalance = async ({ address }: { address: string }) => {
    const balance = await this.provider.getBalance(address);
    return Number(formatEther(balance));
  };

  getTransactionInfo = async (txId: string): Promise<TransactionResponse> => {
    const res = await this.provider.getTransaction(txId);
    if (!res) throw new Error(`Error getting transaction info: ${txId}`);
    return res;
  };

  getTransactionReceipts = async (
    txId: string
  ): Promise<TransactionReceipt | null> =>
    this.provider.getTransactionReceipt(txId);

  getBalance: CryptoService<
    unknown,
    NETWORK_NAME.ethereum | NETWORK_NAME.polygon
  >["getBalance"] = async ({ address, paymentUnit = PAYMENT_UNITS.USDC }) => {
    if (paymentUnit === networks[this.blockchain].unit)
      return this.getCryptoBalance({ address });

    const contract = new ethers.Contract(
      this.getContractAddress(paymentUnit),
      ABI_ERC20,
      this.provider
    );
    if (!contract) throw new Error("contract not found");
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
    ]);
    return Number(balance) / 10 ** Number(decimals);
  };

  sendUsdcTransactionWalletConnect = async (
    usdAmount: number,
    walletConnectProvider: WalletConnectProvider
  ): Promise<string> => {
    const provider = new BrowserProvider(walletConnectProvider);
    const contractRunner = await provider.getSigner();
    const contract = new Contract(
      this.getContractAddress(),
      ABI_ERC20,
      contractRunner
    );
    const txnResponse = (await contract.transfer(
      this.receiver,
      usdAmount * 10 ** 6
    )) as TransactionResponse;
    return txnResponse.hash;
  };

  getTxnEvmParam = (
    payerAddress: string,
    usdAmount: number,
    cryptoPriceInUsd: number
  ): TxnParam => {
    const cryptoAmount =
      Number((usdAmount / cryptoPriceInUsd).toFixed(this.decimals)) * 10 ** 18;
    return {
      to: this.receiver,
      from: payerAddress,
      value: cryptoAmount.toString(16),
    };
  };

  sendTransactionEthers = async (
    usdAmount: number,
    cryptoPriceInUsd: number
  ): Promise<{ txnId: string; sender: string } | undefined> => {
    const provider = new BrowserProvider(window.ethereum);
    const [, , [sender]] = await Promise.all([
      provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]),
      provider.send("wallet_switchEthereumChain", [{ chainId: this.chainId }]),
      provider.send("eth_requestAccounts", []),
    ]);
    const txnParam = this.getTxnEvmParam(sender, usdAmount, cryptoPriceInUsd);
    const { hash }: TransactionResponse = await provider.send(
      "eth_sendTransaction",
      [txnParam]
    );
    if (!hash || !sender) throw new Error("Transaction not signed");
    return { txnId: hash, sender };
  };

  sendUsdcTransactionWebIntegration = async (
    usdAmount: number
  ): Promise<{ txnId: string; sender: string }> => {
    const provider = new BrowserProvider(window.ethereum);
    const [, , [sender], contractRunner] = await Promise.all([
      provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]),
      provider.send("wallet_switchEthereumChain", [{ chainId: this.chainId }]),
      provider.send("eth_requestAccounts", []),
      provider.getSigner(),
    ]);
    const contract = new Contract(
      this.getContractAddress(),
      ABI_ERC20,
      contractRunner
    );
    const { hash }: TransactionResponse = await contract.transfer(
      this.receiver,
      usdAmount * 10 ** 6
    );
    if (!hash || !sender) throw new Error("Transaction not signed");
    return { txnId: hash, sender };
  };

  waitForTransaction = async (txId: string) => {
    return this.provider.waitForTransaction(txId);
  };

  getTransactionProgress: CryptoService["getTransactionProgress"] =
    async txId => {
      const transactionReceipts = await this.getTransactionReceipts(txId);
      const currentConfirmations = await transactionReceipts?.confirmations();
      return Math.min(
        (currentConfirmations || 0 / this.confirmations) * 100,
        100
      );
    };

  transaction: CryptoService<
    unknown,
    NETWORK_NAME.ethereum | NETWORK_NAME.polygon
  >["transaction"] = async ({ account, amount, to, unit }) => {
    if (unit === PAYMENT_UNITS.ETH) {
      return "";
    }
    await this.invokeSignModal(`Sign Transaction`);
    const signingKey = new SigningKey(account.sk);
    const wallet = new Wallet(signingKey, this.provider);
    const contract = this.getContract(unit, wallet);
    const decimals = await contract.decimals();
    const calculatedAmount = parseUnits(amount.toString(), decimals);

    // const data = contract.interface.encodeFunctionData("transfer", [
    //   to,
    //   calculatedAmount,
    // ]);
    const feeData = await this.provider.getFeeData();

    const nonce = await this.provider.getTransactionCount(
      account.addr,
      "latest"
    );
    // const gasLimit = await this.provider.estimateGas({
    //   data,
    //   to,
    //   from: account.addr,
    //   nonce,
    //   maxFeePerGas: feeData.maxFeePerGas,
    //   maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    //   chainId: parseInt(this.chainId, 16),
    //   type: 2,
    // });
    const response = await contract.transfer(to, calculatedAmount, {
      nonce,
      gasLimit: parseUnits("250000", "wei"),
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      chainId: parseInt(this.chainId, 16),
      type: 2,
    });

    // const tx: TransactionRequest = {
    //   to,
    //   data: contract.interface.encodeFunctionData("transfer", [
    //     to,
    //     calculatedAmount,
    //   ]),
    //   nonce,
    //   gasLimit: parseUnits("250000", "wei"),
    //   maxFeePerGas: feeData.maxFeePerGas,
    //   maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    //   chainId: parseInt(this.chainId, 16),
    //   type: 2,
    // };

    // await this.invokeSignModal("Sign Ethereum transaction");
    // await wallet.signTransaction(res);
    // const { hash } = await wallet.sendTransaction(tx);
    return response.hash;
  };
}
