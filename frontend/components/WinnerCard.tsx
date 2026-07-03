interface WinnerCardProps {
  full_name: string
  position: string
  prize: string | null
}

const positionEmoji: Record<string, string> = {
  '1st Place': '🥇', '2nd Place': '🥈', '3rd Place': '🥉',
}

export default function WinnerCard({ full_name, position, prize }: WinnerCardProps) {
  const emoji = positionEmoji[position] || '🏆'
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1">
          <div className="text-indigo-400 text-sm font-medium mb-1">{position}</div>
          <div className="text-white font-bold text-lg">{full_name}</div>
          {prize && <div className="text-gray-400 text-sm mt-1">🎁 {prize}</div>}
        </div>
      </div>
    </div>
  )
}
