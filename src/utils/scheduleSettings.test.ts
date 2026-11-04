import { describe, expect, it } from 'vitest'
import { LATER_TIMES_ON_TOP_KEY, readLaterTimesOnTop, saveLaterTimesOnTop } from './scheduleSettings'

const fakeStorage = () => {
  const items = new Map<string, string>()
  const storage = {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value)
    },
  }
  return () => storage
}

const blockedStorage = () => {
  throw new Error('storage is blocked')
}

describe('later times on top setting (schedule-grid FR-7)', () => {
  it('[TC-4K1L] is off when nothing is saved', () => {
    expect(readLaterTimesOnTop(fakeStorage())).toBe(false)
  })

  it('[TC-TTCE] reads the saved value again after a reload', () => {
    const storage = fakeStorage()
    saveLaterTimesOnTop(true, storage)
    expect(storage().getItem(LATER_TIMES_ON_TOP_KEY)).toBe('true')
    expect(readLaterTimesOnTop(storage)).toBe(true)
    saveLaterTimesOnTop(false, storage)
    expect(readLaterTimesOnTop(storage)).toBe(false)
  })

  it('[TC-6O46] reads as off and saves with no error when the browser blocks storage', () => {
    expect(readLaterTimesOnTop(blockedStorage)).toBe(false)
    expect(() => saveLaterTimesOnTop(true, blockedStorage)).not.toThrow()
  })
})
