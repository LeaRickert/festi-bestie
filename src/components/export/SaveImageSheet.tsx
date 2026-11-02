import { useEffect, useState } from 'react'
import { Share } from 'lucide-react'
import { canShareFile } from '../../export/downloadPng'
import Sheet from '../Sheet'

interface SaveImageSheetProps {
  file: File
  onClose: () => void
}

// A phone browser cannot download to the photo gallery, so the sheet shows the
// image to press and hold, and opens the share menu where the browser can share
// files (export FR-15, FR-16). navigator.share needs a fresh tap, and drawing
// the image takes too long to call it from the tap on the export button.
const SaveImageSheet = ({ file, onClose }: SaveImageSheetProps) => {
  const [url, setUrl] = useState('')
  const [shareFailed, setShareFailed] = useState(false)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const showShare = canShareFile(file) && !shareFailed

  const handleShare = async () => {
    try {
      await navigator.share({ files: [file] })
    } catch (err) {
      // AbortError: the user closed the share menu, which is not a failure.
      if ((err as Error).name !== 'AbortError') setShareFailed(true)
    }
  }

  return (
    <Sheet
      titleId="save-image-title"
      onClose={onClose}
      header={
        <h2 id="save-image-title" className="text-white font-medium pt-2.5">
          Save your schedule
        </h2>
      }
    >
      {url && <img src={url} alt="Your schedule" className="mx-auto max-h-[55vh] w-auto rounded-lg" />}
      {showShare && (
        <button
          type="button"
          onClick={handleShare}
          className="mt-3 flex w-full items-center justify-center px-3 py-2.5 bg-white text-page rounded-md font-medium hover:bg-white/90 transition-colors text-sm"
        >
          <Share className="h-4 w-4 mr-1.5" />
          Save image
        </button>
      )}
      <p className="mt-2 text-center text-white/60 text-sm">
        {showShare ? 'Or press and hold the image to save it.' : 'Press and hold the image to save it.'}
      </p>
    </Sheet>
  )
}

export default SaveImageSheet
