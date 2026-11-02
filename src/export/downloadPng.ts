import html2canvas from 'html2canvas'
import { IMAGE_BACKGROUND, type ImageSize } from './scheduleHtml'

// html2canvas finds the text baseline with a hidden image next to sample text,
// in a div that it adds to the body. The Tailwind reset makes images block level,
// which moves that image to the next line, so all text is drawn too low.
// This selector matches only that image, not the images of the app.
const BASELINE_FIX_CSS = 'body > div:not(#root) > img { display: inline; }'

// Draws the schedule HTML off screen into a PNG file of the image size
// (export FR-10). Throws when the image cannot be made.
export async function renderSchedulePng(html: string, size: ImageSize, fileName: string): Promise<File> {
  const host = document.createElement('div')
  host.style.cssText = 'position: fixed; top: -9999px; left: -9999px;'
  host.innerHTML = html
  document.body.appendChild(host)
  const baselineFix = document.createElement('style')
  baselineFix.textContent = BASELINE_FIX_CSS
  document.head.appendChild(baselineFix)
  try {
    // html2canvas does not wait for web fonts. If Inter cannot load, the image uses the fallback font.
    await document.fonts.load("1em 'Inter Variable'", host.textContent ?? '').catch(() => {})
    const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
      backgroundColor: IMAGE_BACKGROUND,
      scale: size.scale,
      width: size.width,
      height: size.height,
    })
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('The canvas did not make a PNG')
    return new File([blob], fileName, { type: 'image/png' })
  } finally {
    baselineFix.remove()
    document.body.removeChild(host)
  }
}

export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.download = file.name
  link.href = url
  link.click()
  // Safari reads the URL after click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

type ShareNavigator = Pick<Navigator, 'canShare' | 'share'>

// Not every browser has canShare, and some that do cannot share files (export FR-16).
export function canShareFile(file: File, nav: Partial<ShareNavigator> = navigator): boolean {
  return Boolean(nav.share && nav.canShare?.({ files: [file] }))
}
