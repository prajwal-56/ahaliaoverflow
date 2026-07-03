import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface EventCardProps {
  id: string
  title: string
  description: string
  date: string
  venue: string
  status: string
  cover_image_url: string | null
  capacity?: number
}

const statusConfig: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  ongoing: { label: 'Ongoing', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completed', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

export default function EventCard({ id, title, description, date, venue, status, cover_image_url }: EventCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.upcoming
  const eventDate = new Date(date)
  return (
    <Link href={`/events/${id}`} className="group block">
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800/80 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>{statusInfo.label}</span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">{title}</h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{description}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>📅</span>
              <span>{format(eventDate, 'EEE, d MMM yyyy')} · {format(eventDate, 'h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>📍</span>
              <span className="truncate">{venue}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
