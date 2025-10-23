import { useState, useMemo, useEffect } from 'react'
import { X, Download, Calendar, MapPin, Star } from 'lucide-react'
import html2canvas from 'html2canvas'

const ExportScheduleModal = ({ isOpen, onClose, acts, festivalName, ratings = {} }) => {
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedStages, setSelectedStages] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  // Get unique days from acts
  const days = useMemo(() => {
    return [...new Set(acts.filter(act => act.day).map(act => act.day))].sort()
  }, [acts])

  // Set default selected day
  useEffect(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0])
    }
  }, [days, selectedDay])

  // Filter acts by selected day
  const dayActs = useMemo(() => {
    return acts.filter(act => act.day === selectedDay)
  }, [acts, selectedDay])

  // Get unique stages from filtered acts
  const allStages = useMemo(() => {
    return [...new Set(dayActs.filter(act => act.stage).map(act => act.stage))].sort()
  }, [dayActs])

  // Update selected stages when day changes
  useEffect(() => {
    if (allStages.length > 0) {
      setSelectedStages(allStages) // Select all stages by default
    }
  }, [allStages])

  // Filter acts by selected stages
  const filteredActs = useMemo(() => {
    return dayActs.filter(act => selectedStages.includes(act.stage))
  }, [dayActs, selectedStages])

  // Generate time slots (festival runs from 1 PM to 12 AM)
  const timeSlots = useMemo(() => {
    const slots = []
    // 1 PM to 11 PM (13:00 to 23:00)
    for (let hour = 13; hour <= 23; hour++) {
      const displayHour = hour - 12 // Convert to 1-11 format
      slots.push(displayHour.toString())
    }
    // 12 AM (00:00)
    slots.push('12')
    return slots
  }, [])

  // Generate half-hour time slots for grid lines
  const halfHourSlots = useMemo(() => {
    const slots = []
    // 1 PM to 11 PM (13:00 to 23:00)
    for (let hour = 13; hour <= 23; hour++) {
      const displayHour = hour - 12 // Convert to 1-11 format
      slots.push({ hour: displayHour.toString(), isHalfHour: false })
      slots.push({ hour: displayHour.toString(), isHalfHour: true })
    }
    // 12 AM (00:00)
    slots.push({ hour: '12', isHalfHour: false })
    return slots
  }, [])

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [time, period] = timeStr.split(' ')
      const [hours, minutes] = time.split(':').map(Number)
      let totalMinutes = hours * 60 + minutes
      
      if (period === 'AM' && hours === 12) {
        totalMinutes = minutes
      } else if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60
      }
      
      return totalMinutes
    }
    
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Convert simple number format to minutes (1 = 1 PM = 13:00, 12 = 12 AM = 00:00)
  const simpleTimeToMinutes = (timeStr) => {
    const hour = parseInt(timeStr)
    let actualHour = hour
    
    if (hour >= 1 && hour <= 11) {
      actualHour = hour + 12
    } else if (hour === 12) {
      actualHour = 0
    }
    
    return actualHour * 60
  }

  // Get acts for a specific stage and time slot
  const getActsForSlot = (stage, timeSlot) => {
    const slotStartMinutes = simpleTimeToMinutes(timeSlot)
    const slotEndMinutes = slotStartMinutes + 60
    
    const acts = filteredActs.filter(act => {
      if (act.stage !== stage) return false
      if (!act.startTime || !act.length) return false
      
      const actStartMinutes = timeToMinutes(act.startTime)
      const actEndMinutes = actStartMinutes + act.length
      
      return actStartMinutes < slotEndMinutes && actEndMinutes > slotStartMinutes
    })
    
    // Debug logging
    if (acts.length > 0) {
      console.log(`Found ${acts.length} acts for stage ${stage} at time ${timeSlot}:`, acts.map(a => a.artist))
    }
    
    return acts
  }

  // Calculate act position and height for grid
  const getActStyle = (act, timeSlot) => {
    const slotStartMinutes = simpleTimeToMinutes(timeSlot)
    const actStartMinutes = timeToMinutes(act.startTime)
    const actEndMinutes = actStartMinutes + act.length
    
    // Calculate position within the hour slot (0-60 minutes)
    const topOffset = Math.max(0, actStartMinutes - slotStartMinutes)
    const height = Math.min(act.length, slotStartMinutes + 60 - actStartMinutes)
    
    // Convert minutes to pixels (assuming 1 minute = 1 pixel for now)
    const topPixels = topOffset
    const heightPixels = Math.max(height, 20) // Minimum height of 20px
    
    // Debug logging
    console.log(`Act: ${act.artist}, TimeSlot: ${timeSlot}, SlotStart: ${slotStartMinutes}, ActStart: ${actStartMinutes}, TopOffset: ${topOffset}, Height: ${height}, TopPixels: ${topPixels}, HeightPixels: ${heightPixels}`)
    
    return {
      top: `${topPixels}px`,
      height: `${heightPixels}px`,
      position: 'absolute',
      width: '100%',
      zIndex: 10
    }
  }

  // Get visual styling based on rating
  const getActVisualStyle = (act) => {
    const rating = ratings[act.id] || 0
    
    if (rating >= 5) {
      // Highest priority - most prominent
      return {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        border: '2px solid #ff4757',
        boxShadow: '0 4px 20px rgba(255, 71, 87, 0.4)',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    } else if (rating >= 4) {
      // High priority - stand out more
      return {
        background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
        border: '2px solid #ff9ff3',
        boxShadow: '0 2px 10px rgba(255, 159, 243, 0.3)',
        fontWeight: '600',
        fontSize: '13px'
      }
    } else if (rating >= 3) {
      // Medium priority - stand out
      return {
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        border: '2px solid #74b9ff',
        boxShadow: '0 2px 8px rgba(116, 185, 255, 0.3)',
        fontWeight: '600',
        fontSize: '13px'
      }
    } else {
      // Normal priority
      return {
        background: 'rgba(139, 92, 246, 0.2)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        fontWeight: 'normal',
        fontSize: '12px'
      }
    }
  }

  const handleStageToggle = (stage) => {
    setSelectedStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    )
  }

  const handleSelectAllStages = () => {
    setSelectedStages(allStages)
  }

  const handleDeselectAllStages = () => {
    setSelectedStages([])
  }

  const generatePreviewHtml = () => {
    if (!selectedDay || selectedStages.length === 0) return ''

    // Detect device type and set appropriate dimensions
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768
    
    let containerWidth, containerHeight, fontSize, padding, timeColumnWidth
    
    if (isMobile && !isTablet) {
      containerWidth = 393
      containerHeight = 852
      fontSize = '11px'
      padding = '15px'
      timeColumnWidth = '20px'
    } else if (isTablet) {
      containerWidth = 768
      containerHeight = 1024
      fontSize = '14px'
      padding = '30px'
      timeColumnWidth = '35px'
    } else {
      containerWidth = 393
      containerHeight = 852
      fontSize = '11px'
      padding = '15px'
      timeColumnWidth = '20px'
    }

    // Create schedule grid HTML
    let scheduleHtml = `
      <div style="
        width: ${containerWidth}px;
        height: ${containerHeight}px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        padding: ${padding};
        font-family: 'Inter', sans-serif;
        color: white;
        border-radius: 12px;
        overflow: hidden;
        margin: 0 auto;
      ">
        <!-- Header -->
        <div style="margin-bottom: 15px;">
          <h1 style="font-size: ${isMobile && !isTablet ? '16px' : '18px'}; font-weight: bold; margin-bottom: 8px; text-align: center;">
            ${selectedDay.toUpperCase()} - ${festivalName}
          </h1>
          <div style="text-align: center; font-size: ${isMobile && !isTablet ? '10px' : '12px'}; opacity: 0.8; margin-bottom: 15px;">
            Generated on ${new Date().toLocaleDateString()} • ${selectedStages.length} stages
          </div>
        </div>

        <!-- Schedule Grid -->
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border-radius: ${isMobile && !isTablet ? '8px' : '12px'};
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: ${fontSize};
        ">
          <!-- Header Row -->
          <div style="
            display: flex;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
          ">
            <!-- Empty time column header -->
            <div style="
              width: ${timeColumnWidth};
              padding: ${isMobile && !isTablet ? '4px' : '8px'};
              border-right: 1px solid rgba(255, 255, 255, 0.1);
            "></div>
    `

    // Add stage headers
    selectedStages.forEach(stage => {
      scheduleHtml += `
        <div style="
          flex: 1;
          padding: ${isMobile && !isTablet ? '8px' : '12px'};
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: bold;
          text-align: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
          font-size: ${isMobile && !isTablet ? '10px' : '12px'};
        ">${stage}</div>
      `
    })

    scheduleHtml += `</div>`

    // Add time slots
    timeSlots.forEach(timeSlot => {
      scheduleHtml += `
        <div style="
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          min-height: ${isMobile && !isTablet ? '50px' : '60px'};
          position: relative;
        ">
          <!-- Half-hour grid line -->
          <div style="
            position: absolute;
            top: 50%;
            left: ${timeColumnWidth};
            right: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.05);
            z-index: 1;
          "></div>

          <!-- Time column -->
          <div style="
            width: ${timeColumnWidth};
            padding: ${isMobile && !isTablet ? '2px 1px' : '3px 2px'};
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            background: rgba(255, 255, 255, 0.05);
            font-weight: 600;
            font-size: ${isMobile && !isTablet ? '8px' : '10px'};
            padding-top: ${isMobile && !isTablet ? '4px' : '6px'};
            padding-left: ${isMobile && !isTablet ? '2px' : '3px'};
          ">${timeSlot}</div>
      `

      // Add stage columns
      selectedStages.forEach(stage => {
        scheduleHtml += `
          <div style="
            flex: 1;
            padding: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            min-height: ${isMobile && !isTablet ? '50px' : '60px'};
          ">
        `

        const actsForSlot = getActsForSlot(stage, timeSlot)
        actsForSlot.forEach(act => {
          const visualStyle = getActVisualStyle(act)
          const style = getActStyle(act, timeSlot)
          
          // Format times
          const formatTime = (timeStr) => {
            if (timeStr.includes('AM') || timeStr.includes('PM')) {
              return timeStr
            }
            const [hours, minutes] = timeStr.split(':').map(Number)
            const period = hours >= 12 ? 'PM' : 'AM'
            const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
          }
          
          const startTime = formatTime(act.startTime)
          const endTime = formatTime(new Date(new Date(`2000-01-01 ${act.startTime}`).getTime() + act.length * 60000).toTimeString().slice(0, 5))

          scheduleHtml += `
            <div style="
              position: absolute;
              left: 0;
              width: 100%;
              padding: ${isMobile && !isTablet ? '2px 3px' : '4px 6px'};
              border-radius: ${isMobile && !isTablet ? '3px' : '4px'};
              font-size: ${isMobile && !isTablet ? '7px' : '9px'};
              font-weight: ${visualStyle.fontWeight};
              background: ${visualStyle.background};
              border: ${visualStyle.border};
              box-shadow: ${visualStyle.boxShadow || 'none'};
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
              overflow: visible;
              white-space: normal;
              line-height: 1.1;
              word-wrap: break-word;
              top: ${style.top};
              height: ${style.height};
            ">
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <div style="font-weight: bold; font-size: ${isMobile && !isTablet ? '7px' : '8px'};">${act.artist}</div>
                <div style="font-size: ${isMobile && !isTablet ? '6px' : '7px'}; opacity: 0.9;">${startTime} - ${endTime}</div>
              </div>
            </div>
          `
        })

        scheduleHtml += `</div>`
      })

      scheduleHtml += `</div>`
    })

    scheduleHtml += `</div></div>`

    return scheduleHtml
  }

  const handlePreview = () => {
    const html = generatePreviewHtml()
    setPreviewHtml(html)
    setShowPreview(true)
  }

  const exportSchedule = async () => {
    if (!selectedDay || selectedStages.length === 0) return
    
    setIsExporting(true)
    
    try {
      // Detect device type and set appropriate dimensions
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768
      
      let containerWidth, containerHeight, fontSize, padding, timeColumnWidth
      
      if (isMobile && !isTablet) {
        // Mobile phone dimensions (iPhone 15: 393x852) - optimized for mobile
        containerWidth = 393
        containerHeight = 852
        fontSize = '11px'
        padding = '15px'
        timeColumnWidth = '25px' // Even smaller - just wide enough for 2 digits
      } else if (isTablet) {
        // Tablet dimensions
        containerWidth = 768
        containerHeight = 1024
        fontSize = '14px'
        padding = '30px'
        timeColumnWidth = '35px'
      } else {
        // Desktop - default to iPhone 15 dimensions
        containerWidth = 393
        containerHeight = 852
        fontSize = '11px'
        padding = '15px'
        timeColumnWidth = '25px'
      }

      // Create a temporary container for the schedule
      const container = document.createElement('div')
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: ${containerWidth}px;
        height: ${containerHeight}px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        padding: ${padding};
        font-family: 'Inter', sans-serif;
        color: white;
        border-radius: 12px;
        overflow: hidden;
      `

      // Create header
      const header = document.createElement('div')
      header.innerHTML = `
        <h1 style="font-size: ${isMobile && !isTablet ? '20px' : '24px'}; font-weight: bold; margin-bottom: 8px; text-align: center;">
          ${festivalName} - ${selectedDay}
        </h1>
        <div style="text-align: center; font-size: ${isMobile && !isTablet ? '10px' : '12px'}; opacity: 0.8; margin-bottom: 15px;">
          Generated on ${new Date().toLocaleDateString()} • ${selectedStages.length} stages
        </div>
      `
      container.appendChild(header)

      // Create schedule grid
      const scheduleGrid = document.createElement('div')
      scheduleGrid.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        border-radius: ${isMobile && !isTablet ? '8px' : '12px'};
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-size: ${fontSize};
      `

      // Header row - no time column title for mobile optimization
      const headerRow = document.createElement('div')
      headerRow.style.cssText = `
        display: flex;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
      `

      // Empty time column header (no title)
      const timeHeader = document.createElement('div')
      timeHeader.style.cssText = `
        width: ${timeColumnWidth};
        padding: ${isMobile && !isTablet ? '4px' : '8px'};
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      `
      headerRow.appendChild(timeHeader)

      selectedStages.forEach(stage => {
        const stageHeader = document.createElement('div')
        stageHeader.style.cssText = `
          flex: 1;
          padding: ${isMobile && !isTablet ? '8px' : '12px'};
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: bold;
          text-align: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
          font-size: ${isMobile && !isTablet ? '10px' : '12px'};
        `
        stageHeader.textContent = stage
        headerRow.appendChild(stageHeader)
      })

      scheduleGrid.appendChild(headerRow)

      // Time slots with half-hour grid lines
      timeSlots.forEach(timeSlot => {
        const timeRow = document.createElement('div')
        timeRow.style.cssText = `
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          min-height: ${isMobile && !isTablet ? '50px' : '60px'};
          position: relative;
        `

        // Add half-hour grid line
        const halfHourLine = document.createElement('div')
        halfHourLine.style.cssText = `
          position: absolute;
          top: 50%;
          left: ${timeColumnWidth};
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          z-index: 1;
        `
        timeRow.appendChild(halfHourLine)

        // Time column - ultra compact, aligned to start
        const timeColumn = document.createElement('div')
        timeColumn.style.cssText = `
          width: ${timeColumnWidth};
          padding: ${isMobile && !isTablet ? '2px 1px' : '3px 2px'};
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          background: rgba(255, 255, 255, 0.05);
          font-weight: 600;
          font-size: ${isMobile && !isTablet ? '8px' : '10px'};
          padding-top: ${isMobile && !isTablet ? '4px' : '6px'};
          padding-left: ${isMobile && !isTablet ? '2px' : '3px'};
        `
        timeColumn.textContent = timeSlot
        timeRow.appendChild(timeColumn)

        // Stage columns - optimized for mobile space usage
        selectedStages.forEach(stage => {
          const stageColumn = document.createElement('div')
          stageColumn.style.cssText = `
            flex: 1;
            padding: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            min-height: ${isMobile && !isTablet ? '50px' : '60px'};
          `

          const actsForSlot = getActsForSlot(stage, timeSlot)
          actsForSlot.forEach(act => {
            const actDiv = document.createElement('div')
            const visualStyle = getActVisualStyle(act)
            
            actDiv.style.cssText = `
              position: absolute;
              left: 0;
              width: 100%;
              padding: ${isMobile && !isTablet ? '2px 3px' : '4px 6px'};
              border-radius: ${isMobile && !isTablet ? '3px' : '4px'};
              cursor: pointer;
              font-size: ${isMobile && !isTablet ? '7px' : '9px'};
              font-weight: ${visualStyle.fontWeight};
              background: ${visualStyle.background};
              border: ${visualStyle.border};
              box-shadow: ${visualStyle.boxShadow || 'none'};
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
              overflow: visible;
              white-space: normal;
              line-height: 1.1;
              word-wrap: break-word;
            `

            // Format start and end times
            const formatTime = (timeStr) => {
              if (timeStr.includes('AM') || timeStr.includes('PM')) {
                return timeStr
              }
              // Convert 24-hour format to 12-hour format
              const [hours, minutes] = timeStr.split(':').map(Number)
              const period = hours >= 12 ? 'PM' : 'AM'
              const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
              return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
            }
            
            const startTime = formatTime(act.startTime)
            const endTime = formatTime(new Date(new Date(`2000-01-01 ${act.startTime}`).getTime() + act.length * 60000).toTimeString().slice(0, 5))
            
            actDiv.innerHTML = `
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <div style="font-weight: bold; font-size: ${isMobile && !isTablet ? '7px' : '8px'};">${act.artist}</div>
                <div style="font-size: ${isMobile && !isTablet ? '6px' : '7px'}; opacity: 0.9;">${startTime} - ${endTime}</div>
              </div>
            `

            const style = getActStyle(act, timeSlot)
            Object.assign(actDiv.style, style)
            
            stageColumn.appendChild(actDiv)
          })

          timeRow.appendChild(stageColumn)
        })

        scheduleGrid.appendChild(timeRow)
      })

      container.appendChild(scheduleGrid)

      // Add legend only for larger screens to save space on mobile
      if (!isMobile || isTablet) {
        const legend = document.createElement('div')
        legend.style.cssText = `
          margin-top: ${isTablet ? '20px' : '15px'};
          padding: ${isTablet ? '15px' : '10px'};
          background: rgba(255, 255, 255, 0.05);
          border-radius: ${isTablet ? '8px' : '6px'};
          border: 1px solid rgba(255, 255, 255, 0.1);
        `
        legend.innerHTML = `
          <h3 style="font-size: ${isTablet ? '16px' : '14px'}; font-weight: bold; margin-bottom: 10px; color: #fbbf24;">Legend</h3>
          <div style="display: flex; gap: ${isTablet ? '20px' : '15px'}; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: ${isTablet ? '16px' : '12px'}; height: ${isTablet ? '16px' : '12px'}; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 3px; border: 2px solid #ff4757;"></div>
              <span style="font-size: ${isTablet ? '12px' : '10px'};"><strong>5⭐</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: ${isTablet ? '16px' : '12px'}; height: ${isTablet ? '16px' : '12px'}; background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); border-radius: 3px; border: 2px solid #ff9ff3;"></div>
              <span style="font-size: ${isTablet ? '12px' : '10px'};"><strong>4⭐</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: ${isTablet ? '16px' : '12px'}; height: ${isTablet ? '16px' : '12px'}; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); border-radius: 3px; border: 2px solid #74b9ff;"></div>
              <span style="font-size: ${isTablet ? '12px' : '10px'};"><strong>3⭐</strong></span>
            </div>
          </div>
        `
        container.appendChild(legend)
      }

      // Debug logging
      console.log('Export Debug Info:')
      console.log('Selected Day:', selectedDay)
      console.log('Selected Stages:', selectedStages)
      console.log('Filtered Acts:', filteredActs)
      console.log('Time Slots:', timeSlots)
      
      // Add to DOM temporarily
      document.body.appendChild(container)

      // Generate canvas
      const canvas = await html2canvas(container, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      })

      // Open image in new tab for debugging instead of downloading
      const imageDataUrl = canvas.toDataURL('image/png')
      const newTab = window.open()
      newTab.document.write(`
        <html>
          <head>
            <title>${festivalName} - ${selectedDay} Schedule</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #1a1a2e; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
              }
              img { 
                max-width: 100%; 
                height: auto; 
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              }
              .download-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #8b5cf6;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
              }
              .download-btn:hover {
                background: #7c3aed;
              }
            </style>
          </head>
          <body>
            <img src="${imageDataUrl}" alt="${festivalName} - ${selectedDay} Schedule" />
            <a href="${imageDataUrl}" download="${festivalName.replace(/\s+/g, '_')}_${selectedDay.replace(/\s+/g, '_')}_schedule.png" class="download-btn">
              Download Image
            </a>
          </body>
        </html>
      `)
      newTab.document.close()

      // Clean up
      document.body.removeChild(container)
      
    } catch (error) {
      console.error('Error generating schedule image:', error)
      alert('Error generating schedule. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Download className="h-6 w-6 text-festival-purple" />
            <h2 className="text-2xl font-bold text-white">Export Schedule</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white/60" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Day Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-festival-purple" />
              <h3 className="text-lg font-semibold text-white">Select Day</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDay === day
                      ? 'bg-festival-purple text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Selection */}
          {selectedDay && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-festival-purple" />
                  <h3 className="text-lg font-semibold text-white">Select Stages</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllStages}
                    className="px-3 py-1 text-sm bg-festival-purple/20 text-festival-purple rounded hover:bg-festival-purple/30 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAllStages}
                    className="px-3 py-1 text-sm bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allStages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => handleStageToggle(stage)}
                    className={`p-3 rounded-lg font-medium transition-colors text-left ${
                      selectedStages.includes(stage)
                        ? 'bg-festival-purple text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedDay && selectedStages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/80 text-sm">
                  <p><strong>Day:</strong> {selectedDay}</p>
                  <p><strong>Stages:</strong> {selectedStages.join(', ')}</p>
                  <p><strong>Total Acts:</strong> {filteredActs.length}</p>
                  <p><strong>Interested Acts (3⭐+):</strong> {filteredActs.filter(act => (ratings[act.id] || 0) >= 3).length}</p>
                  <p><strong>High Priority Acts (4⭐+):</strong> {filteredActs.filter(act => (ratings[act.id] || 0) >= 4).length}</p>
                  <p><strong>Must See Acts (5⭐):</strong> {filteredActs.filter(act => (ratings[act.id] || 0) >= 5).length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Area */}
        {showPreview && (
          <div className="border-t border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white/60" />
              </button>
            </div>
            <div className="bg-black/20 rounded-lg p-4 overflow-auto max-h-96">
              <div 
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="scale-75 origin-top-left"
                style={{ transform: 'scale(0.75)', transformOrigin: 'top left' }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/80 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePreview}
            disabled={!selectedDay || selectedStages.length === 0}
            className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Preview
          </button>
          <button
            onClick={exportSchedule}
            disabled={!selectedDay || selectedStages.length === 0 || isExporting}
            className="px-6 py-2 bg-festival-purple text-white rounded-lg font-medium hover:bg-festival-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportScheduleModal
