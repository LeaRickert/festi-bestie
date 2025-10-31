import { Calendar, MapPin, Clock } from 'lucide-react'

const AnnouncedView = ({ festival }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="text-center py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">{festival.name}</h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center text-white/80 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {formatDate(festival.start_date)} - {formatDate(festival.end_date)}
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

        <div className="bg-festival-purple/20 border border-festival-purple/30 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-festival-purple mr-2" />
            <h3 className="text-lg font-bold text-festival-purple">Lineup Coming Soon!</h3>
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
