// hooks/useEnsureNetwork.ts
"use client";

import { useEffect } from "react";
import { switchChain, watchAccount } from "@wagmi/core";
import { wagmi } from "@/app/Privy-provider"; 
                                       
/** wagmi ID for Base-Sepolia */
export const BASE_SEPOLIA = 84532 as const;

/**
 * Keeps the connected wallet on Base-Sepolia.
 * – prompts a switch
 *     • right after the wallet connects
 *     • whenever the user manually changes networks
 */
export default function useEnsureBaseSepolia() {
  useEffect(() => {
    /* start watching as soon as the component mounts */
    const unwatch = watchAccount(wagmi, {
      async onChange(acct) {
        // not connected? → nothing to do
        if (!acct.address) return;

        // already on the right chain? → we're good
        if (acct.chainId === BASE_SEPOLIA) return;

        // otherwise ask the wallet to switch.
        // if the user rejects, we simply stay silent
        try {
          await switchChain(wagmi, { chainId: BASE_SEPOLIA });
        } catch {
          /* user rejected – ignore */
        }
      },
    });

    /* tidy up when the component unmounts */
    return unwatch;
  }, []);
}
