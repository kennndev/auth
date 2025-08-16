// providers.tsx
'use client'

import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { privyConfig as basePrivy } from '@/lib/privy-config'

type ProvidersProps = {
  children: ReactNode
  config?: Partial<PrivyClientConfig>     // ← NEW
}

export const wagmi = createConfig({
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http() },
});


const query = new QueryClient()

export function PrivyProviders({ children, config }: ProvidersProps) {
  /** merge caller‑supplied tweaks with the shared default */
  const merged: PrivyClientConfig = { ...basePrivy, ...config }

  return (
    <PrivyProvider appId="cmc8285yr000yjp0m47vdx6c9" config={merged}>
      <WagmiProvider config={wagmi}>
        <QueryClientProvider client={query}>{children}</QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
