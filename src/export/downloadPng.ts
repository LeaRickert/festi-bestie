import html2canvas from 'html2canvas'
import { IMAGE_BACKGROUND, type ImageSize } from './scheduleHtml'

// Draws the schedule HTML off screen and downloads it as a PNG of the image
// size (export FR-10). Throws when the image cannot be made.
export async function downloadSchedulePng(html: string, size: ImageSize, fileName: string): Promise<void> {
  const host = document.createElement('div')
  host.style.cssText = 'position: fixed; top: -9999px; left: -9999px;'
  host.innerHTML = html
  document.body.appendChild(host)
  try {
    const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
      backgroundColor: IMAGE_BACKGROUND,
      scale: size.scale,
      width: size.width,
      height: size.height,
    })
    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    document.body.removeChild(host)
  }
}
