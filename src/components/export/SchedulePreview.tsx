import { useEffect, useRef, useState } from 'react'
import type { ImageSize } from '../../export/scheduleHtml'

interface SchedulePreviewProps {
  html: string
  size: ImageSize
}

// Shows the same HTML that the PNG is made from, scaled down to the page width
// (export FR-7, FR-13). buildScheduleHtml escapes all festival data.
const SchedulePreview = ({ html, size }: SchedulePreviewProps) => {
  const frame = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!frame.current) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(frame.current)
    return () => observer.disconnect()
  }, [])

  const scale = width ? Math.min(1, width / size.width) : 0

  return (
    <div ref={frame} className="w-full">
      {html ? (
        <div className="mx-auto overflow-hidden rounded-lg" style={{ width: size.width * scale, height: size.height * scale }}>
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: the HTML is built by buildScheduleHtml, which escapes all data
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ) : (
        <p className="py-16 text-center text-white/60 text-sm">Choose a stage to see the wallpaper.</p>
      )}
    </div>
  )
}

export default SchedulePreview
