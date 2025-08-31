import { http, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { defineChain } from "viem";


// Define Bsc testnet chain
const chainId = Number(process.env.NEXT_PUBLIC_BSC_CHAIN_ID);
const rpcUrl = process.env.NEXT_PUBLIC_BSC_RPC_URL ?? ""; 

if (!chainId) {
  throw new Error("BSC_CHAIN_ID is not defined in the environment variables.");
}
export const bscTestnet = defineChain({
  id: chainId,
  name: "BSC Testnet",
  network: "binance smart chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "tBNB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [rpcUrl],
    },
    public: {
      http: [
        rpcUrl
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Bsc Testnet Explorer",
      url: "",
    },
  },
  testnet: true,
});

// Wagmi configuration
export const config = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(
      rpcUrl
    ),
  },
  connectors: [metaMask()],
});
