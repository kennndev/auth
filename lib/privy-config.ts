
import type { PrivyClientConfig } from '@privy-io/react-auth'

export const privyConfig: PrivyClientConfig = {
  /* sign‑in options shown in the Privy modal */
  loginMethods: ['wallet', 'google'],

  /* embedded wallet behaviour */
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },

  /* external wallets */
  externalWallets: {
    walletConnect: { enabled: true },
  },

  /* wallet list order in the modal */
  appearance: {
    walletList: ['metamask', 'wallet_connect'],
  },
}
