import html2canvas from 'html2canvas'

// Draws the schedule HTML off screen and downloads it as a PNG. Throws when the image cannot be made.
export async function downloadSchedulePng(html: string, fileName: string): Promise<void> {
  const host = document.createElement('div')
  host.style.cssText = 'position: fixed; top: -9999px; left: -9999px;'
  host.innerHTML = html
  document.body.appendChild(host)
  try {
    const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    document.body.removeChild(host)
  }
}
