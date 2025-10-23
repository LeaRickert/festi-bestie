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
    <div className="text-center py-16">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-6">{festival.name}</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center text-white/80">
            <Calendar className="h-5 w-5 mr-3" />
            <span className="text-lg">
              {formatDate(festival.start_date)} - {formatDate(festival.end_date)}
            </span>
          </div>
          
          <div className="flex items-center justify-center text-white/80">
            <MapPin className="h-5 w-5 mr-3" />
            <span className="text-lg">{festival.location}</span>
          </div>
        </div>

        {festival.description && (
          <p className="text-white/70 text-lg mb-8">{festival.description}</p>
        )}

        <div className="bg-festival-purple/20 border border-festival-purple/30 rounded-xl p-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-festival-purple mr-3" />
            <h3 className="text-2xl font-bold text-festival-purple">Lineup Coming Soon!</h3>
          </div>
          <p className="text-white/80">
            Stay tuned for artist announcements and schedule updates.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnnouncedView
