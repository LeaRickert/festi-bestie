import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const exportScheduleToImage = async (acts, festivalName, ratings = {}) => {
  // Create a temporary container for the schedule
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 800px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    font-family: 'Inter', sans-serif;
    color: white;
  `

  // Create header
  const header = document.createElement('div')
  header.innerHTML = `
    <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 20px; text-align: center;">
      ${festivalName} - My Schedule
    </h1>
    <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; opacity: 0.8;">
      <span>Generated on ${new Date().toLocaleDateString()}</span>
      <span>${acts.length} acts</span>
    </div>
  `
  container.appendChild(header)

  // Group acts by day
  const actsByDay = acts.reduce((acc, act) => {
    if (!acc[act.day]) acc[act.day] = []
    acc[act.day].push(act)
    return acc
  }, {})

  // Create schedule content
  Object.entries(actsByDay).forEach(([day, dayActs]) => {
    const daySection = document.createElement('div')
    daySection.style.cssText = `
      margin-bottom: 30px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
    `

    const dayHeader = document.createElement('h2')
    dayHeader.textContent = day
    dayHeader.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #fbbf24;
    `
    daySection.appendChild(dayHeader)

    // Sort acts by time
    dayActs.sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.startTime}`)
      const timeB = new Date(`2000-01-01 ${b.startTime}`)
      return timeA - timeB
    })

    dayActs.forEach(act => {
      const actDiv = document.createElement('div')
      actDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      `

      const rating = ratings[act.id]
      const ratingIcon = rating >= 4 ? '⭐' : rating >= 2 ? '❤️' : ''

      actDiv.innerHTML = `
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 16px;">
            ${ratingIcon} ${act.artist}
          </div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">
            ${act.stage} • ${act.genre}
          </div>
        </div>
        <div style="text-align: right; font-size: 14px;">
          <div style="font-weight: bold;">${act.startTime}</div>
          <div style="opacity: 0.8;">${act.length}min</div>
        </div>
      `

      daySection.appendChild(actDiv)
    })

    container.appendChild(daySection)
  })

  // Add to DOM temporarily
  document.body.appendChild(container)

  try {
    // Generate canvas
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download PDF
    pdf.save(`${festivalName.replace(/\s+/g, '_')}_schedule.pdf`)

    // Also create a simple image download
    const link = document.createElement('a')
    link.download = `${festivalName.replace(/\s+/g, '_')}_schedule.png`
    link.href = imgData
    link.click()

  } catch (error) {
    console.error('Error generating schedule image:', error)
    alert('Error generating schedule. Please try again.')
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}

export const exportScheduleToLockScreen = async (acts, festivalName, ratings = {}) => {
  // Create a mobile-optimized version for lock screen
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 400px;
    height: 800px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 20px;
    font-family: 'Inter', sans-serif;
    color: white;
    overflow: hidden;
  `

  // Create header
  const header = document.createElement('div')
  header.innerHTML = `
    <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 10px; text-align: center;">
      ${festivalName}
    </h1>
    <div style="text-align: center; font-size: 12px; opacity: 0.8; margin-bottom: 20px;">
      ${new Date().toLocaleDateString()}
    </div>
  `
  container.appendChild(header)

  // Get today's acts (or first day if no specific day)
  const todayActs = acts.filter(act => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return act.day === today || acts.length === 0
  }).slice(0, 8) // Limit to 8 acts for mobile

  todayActs.forEach((act, index) => {
    const actDiv = document.createElement('div')
    actDiv.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      border-left: 4px solid #8b5cf6;
    `

    const rating = ratings[act.id]
    const ratingIcon = rating >= 4 ? '⭐' : rating >= 2 ? '❤️' : ''

    actDiv.innerHTML = `
      <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
        ${ratingIcon} ${act.artist}
      </div>
      <div style="font-size: 12px; opacity: 0.8;">
        ${act.startTime} • ${act.stage}
      </div>
    `

    container.appendChild(actDiv)
  })

  // Add to DOM temporarily
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })

    const link = document.createElement('a')
    link.download = `${festivalName.replace(/\s+/g, '_')}_lockscreen.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

  } catch (error) {
    console.error('Error generating lock screen image:', error)
    alert('Error generating lock screen image. Please try again.')
  } finally {
    document.body.removeChild(container)
  }
}
