import type { PublicKey, Transaction } from "@solana/web3.js";

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  isConnected?: boolean;

  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}