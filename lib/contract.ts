import type { Abi } from "viem";

export const CONTRACTS = {
  factory: "0x1FCB9649D16e535BbFCb0CeA08270ecB6f303ba7" as const,

  factoryAbi: [
    /* NEW: still keep it in case you need it later */
    {
      name: "getUserCollections",
      type: "function",
      stateMutability: "view",
      inputs:   [{ type: "address" }],
      outputs:  [{ type: "address[]" }],
    },
    {
      name: "getAllCollections",
      type: "function",
      stateMutability: "view",
      inputs:   [],
      outputs:  [{ type: "address[]" }],
    },
  ] as const satisfies Abi,

  nftAbi: [
   {  /* ⇢ added so TS knows the signature */
     name:  "tokenOfOwnerByIndex",
     type:  "function",
     stateMutability: "view",
     inputs:  [{ type: "address" }, { type: "uint256" }],
     outputs: [{ type: "uint256"  }],
   },
    { name: "balanceOf",      type: "function", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
    { name: "tokensOfOwner",  type: "function", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256[]" }] },
    { name: "name",           type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
    { name: "symbol",         type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
    { name: "tokenURI",       type: "function", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "string" }] },
    { name: "totalSupply",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
    { name: "ownerOf",        type: "function", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "address" }] },
    { name: "tokenIdCounter", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  ] as const satisfies Abi,

  /* helpers (unchanged) */
  imageGateway:       (c: string, id: bigint | number) => `https://gateway.pinata.cloud/ipfs/${c}_${id}.png`,
  collectionPreview:  (_c: string) => "/cardifyN.png",
} as const;
