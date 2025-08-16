import Image from "next/image"
import { useState } from "react"
import { User as UserIcon } from "lucide-react"

function getInitials(name?: string) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || "").join("") || "?"
}

export function AvatarBubble({
  src,
  name,
  onClick,
  title,
  size = 40,
}: {
  src?: string | null
  name?: string | null
  onClick?: () => void
  title?: string
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  const showImage = !!src && !failed

  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-full overflow-hidden border-2 border-cyber-cyan hover:border-cyber-green transition-colors grid place-items-center"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={name || "User"}
          width={size}
          height={size}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : name ? (
        <span className="text-cyber-cyan text-sm font-bold">
          {getInitials(name)}
        </span>
      ) : (
        <UserIcon className="w-5 h-5 text-cyber-cyan" />
      )}
    </button>
  )
}
