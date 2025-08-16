/* ───────────────── Wallet Button ───────────────── */
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { ready, login } = usePrivy()

  if (!ready) return null         

  /* ─── already connected ─── */
  if (isConnected)
    return (
      <Button variant="outline" onClick={() => disconnect()}>
        {address!.slice(0, 6)}…{address!.slice(-4)}
      </Button>
    )

  /* ─── not connected ─── */
  const first = connectors.find(c => c.ready)

  const handleClick = () => {
    if (first) connect({ connector: first })
    else       login()             
  }

  return (
    <Button onClick={handleClick} className="bg-gradient-to-r from-blue-500 to-purple-600">
      Connect&nbsp;Wallet
    </Button>
  )
}
