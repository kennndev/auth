// hooks/useCollectionMeta.ts
import { useReadContracts } from "wagmi";
import { CONTRACTS } from "@/lib/contract";

export function useCollectionMeta(address: `0x${string}`) {
  const { data } = useReadContracts({
    contracts: [
      {
        address,
        abi: CONTRACTS.nftAbi,
        functionName: "name",
      },
      {
        address,
        abi: CONTRACTS.nftAbi,
        functionName: "symbol",
      },
    ],
  });

  return {
    name: (data?.[0]?.result as string) || "Unknown",
    symbol: (data?.[1]?.result as string) || "NFT",
  };
}
