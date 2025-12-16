import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { normalize } from 'viem/ens';

const APP_NAME = "Base Missions";
const APP_LOGO_URL = "";
const DEFAULT_CHAIN_ID = 8453; // Base Mainnet

// Initialize Viem Client for Base
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

let provider: any | null = null;

export async function resolveBasename(address: string): Promise<string | null> {
  try {
    // Try standard ENS resolution (Base Names are L2 ENS)
    // Note: This relies on the user having set their Primary Name (Reverse Record)
    const name = await publicClient.getEnsName({
      address: address as `0x${string}`,
    });
    return name;
  } catch (e) {
    // console.error("Failed to resolve Basename:", e);
    return null;
  }
}

export async function connectCoinbaseWallet(): Promise<{ address: string; chainId: number }> {
  if (!provider) {
    const sdk = new CoinbaseWalletSDK({ appName: APP_NAME, appLogoUrl: APP_LOGO_URL });
    provider = sdk.makeWeb3Provider({ options: "all" });
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x2105" }] });
    } catch {}
  }
  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
  const chainIdHex: string = await provider.request({ method: "eth_chainId" });
  const chainId = parseInt(chainIdHex, 16);
  const address = (accounts[0] || "").toLowerCase();
  if (!address) throw new Error("No wallet address returned");
  localStorage.setItem("walletAddress", address);
  localStorage.setItem("walletChainId", String(chainId));
  localStorage.setItem("walletProvider", "coinbase");
  return { address, chainId };
}

export function disconnectWallet() {
  localStorage.removeItem("walletAddress");
  localStorage.removeItem("walletChainId");
  localStorage.removeItem("walletProvider");
}

export function getConnectedWallet(): { address?: string; chainId?: number; provider?: string } {
  const address = localStorage.getItem("walletAddress") || undefined;
  const chainIdStr = localStorage.getItem("walletChainId");
  const providerName = localStorage.getItem("walletProvider") || undefined;
  const chainId = chainIdStr ? Number(chainIdStr) : undefined;
  return { address, chainId, provider: providerName || undefined };
}
