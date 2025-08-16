import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { CONTRACTS } from "@/lib/contract";
import { BASE_SEPOLIA } from "@/hooks/useEnsureNetwork";

/* -------- constants -------- */
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const ALCHEMY_URL = ALCHEMY_KEY
  ? `https://base-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/getNFTsForOwner`
  : null;

/** [collection, tokenId] — the flat pair UI expects */
type Pair = [string, bigint];

/** Returns every Cardify NFT the wallet owns (all factory collections) */
export function useOwnedCardify(factory: `0x${string}`) {
  const { address }  = useAccount();
  const client       = usePublicClient({ chainId: BASE_SEPOLIA });

  const [tokens,  setTokens]  = useState<Pair[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !client) return;

    const run = async () => {
      setLoading(true);

      /* 1 ▸ all collections ever deployed */
      const collections = (await client.readContract({
        address: factory,
        abi:     CONTRACTS.factoryAbi,
        functionName: "getAllCollections",
      })) as `0x${string}`[];

      let owned: Pair[] = [];

      /* 2 ▸ Alchemy quick path (if key provided) */
      if (ALCHEMY_URL && collections.length) {
        try {
          const url = new URL(ALCHEMY_URL);
          url.searchParams.append("owner", address);
          collections.forEach(c =>
            url.searchParams.append("contractAddresses[]", c),
          );

          const { ownedNfts = [] } = await fetch(url.toString()).then(r => r.json());

          owned = ownedNfts.map((n: any) => [
            (n.contract?.address ?? n.contractAddress) as string,
            BigInt(n.tokenId ?? "0"),
          ]);
        } catch {/* fall through */}
      }

      /* 3 ▸ on-chain fall-back if Alchemy gave nothing */
      if (owned.length === 0) {
        await Promise.all(
          collections.map(async col => {
            /* 3a ▸ try tokensOfOwner(address) */
            try {
              const ids = (await client.readContract({
                address: col,
                abi:     CONTRACTS.nftAbi,
                functionName: "tokensOfOwner",
                args: [address],
              })) as bigint[];
              ids.forEach(id => owned.push([col, id]));
              return;
            } catch {/* ignore */}
            /* 3b ▸ balanceOf + tokenOfOwnerByIndex */
            try {
              const bal = (await client.readContract({
                address: col,
                abi:     CONTRACTS.nftAbi,
                functionName: "balanceOf",
                args: [address],
              })) as bigint;

              for (let i = 0n; i < bal; i++) {
                const id = (await client.readContract({
                  address: col,
                  abi:     CONTRACTS.nftAbi,
                  functionName: "tokenOfOwnerByIndex",
                  args: [address, i],
                })) as bigint;
                owned.push([col, id]);
              }
              return;
            } catch {/* ignore */}
            /* 3c ▸ final resort: scan tokenIdCounter + ownerOf */
            try {
              const total = (await client.readContract({
                address: col,
                abi:     CONTRACTS.nftAbi,
                functionName: "tokenIdCounter",
              })) as bigint;

              for (let id = 0n; id < total; id++) {
                try {
                  const owner = (await client.readContract({
                    address: col,
                    abi:     CONTRACTS.nftAbi,
                    functionName: "ownerOf",
                    args: [id],
                  })) as `0x${string}`;
                  if (owner.toLowerCase() === address.toLowerCase())
                    owned.push([col, id]);
                } catch {/* burned / gap */ }
              }
            } catch {/* ignore totally */}
          }),
        );
      }

      setTokens(owned);
      setLoading(false);
    };

    run();
  }, [address, factory, client]);

  return { tokens, loading };
}
