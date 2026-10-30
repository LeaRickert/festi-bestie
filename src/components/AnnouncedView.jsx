import { Calendar, MapPin, Clock } from 'lucide-react'
import { formatDateRange } from '../utils/dateUtils'

const AnnouncedView = ({ festival }) => {
  return (
    <div className="text-center py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">{festival.name}</h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center text-white/80 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {formatDateRange(festival.start_date, festival.end_date)}
            </span>
          </div>
          
          <div className="flex items-center justify-center text-white/80 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{festival.location}</span>
          </div>
        </div>

        {festival.description && (
          <p className="text-white/70 text-sm mb-4">{festival.description}</p>
        )}

        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-white mr-2" />
            <h3 className="text-lg font-bold text-white">Lineup Coming Soon!</h3>
          </div>
          <p className="text-white/80 text-sm">
            Stay tuned for artist announcements and schedule updates.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnnouncedView
