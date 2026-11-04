import { useState } from 'react'
import { readLaterTimesOnTop, saveLaterTimesOnTop } from '../utils/scheduleSettings'

// The "Later times on top" setting of this device (schedule-grid FR-7).
export const useLaterTimesOnTop = (): [boolean, (value: boolean) => void] => {
  const [laterOnTop, setLaterOnTop] = useState(() => readLaterTimesOnTop())

  const update = (value: boolean) => {
    setLaterOnTop(value)
    saveLaterTimesOnTop(value)
  }

  return [laterOnTop, update]
}
