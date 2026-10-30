// CSV Import Utility for Festi Bestie
// This utility helps import festival lineup data from CSV files

export const parseCSVLineup = (csvContent, festivalId) => {
  const lines = csvContent.split('\n')
  
  const acts = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(',').map(v => v.trim())
    
    // Map CSV columns to our database schema
    const act = {
      festival_id: festivalId,
      artist: values[0] || '',
      day: values[5] || '',
      start_time: generateRandomTime(), // You might want to parse this from CSV
      length_minutes: 60, // Default length
      stage: values[6] || '',
      special_notes: values[2] || '',
      genre: values[3] || '',
      category: values[4] || '',
      youtube_url: values[1] || '', // Assuming first YouTube field is URL
      youtube_title: values[1] || '', // You might want to parse this differently
      avg_rating: parseFloat(values[7]) || 0
    }
    
    acts.push(act)
  }
  
  return acts
}

const generateRandomTime = () => {
  const hour = Math.floor(Math.random() * 12) + 6 // 6 PM to 6 AM
  const minute = Math.floor(Math.random() * 60)
  return `${hour}:${minute.toString().padStart(2, '0')}:00`
}

export const importActsToSupabase = async (acts) => {
  const { supabase } = await import('./supabase')
  
  try {
    const { data, error } = await supabase
      .from('acts')
      .insert(acts)
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('Error importing acts:', error)
    return { success: false, error }
  }
}

export const exportActsToCSV = (acts) => {
  const headers = [
    'Artist',
    'Day', 
    'Start Time',
    'Length (min)',
    'Stage',
    'Special Notes',
    'Genre',
    'Category',
    'YouTube URL',
    'YouTube Title',
    'Avg Rating'
  ]
  
  const csvContent = [
    headers.join(','),
    ...acts.map(act => [
      act.artist,
      act.day,
      act.start_time,
      act.length_minutes,
      act.stage,
      act.special_notes || '',
      act.genre,
      act.category,
      act.youtube_url || '',
      act.youtube_title || '',
      act.avg_rating || 0
    ].join(','))
  ].join('\n')
  
  return csvContent
}

export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}
