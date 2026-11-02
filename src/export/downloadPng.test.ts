import { describe, expect, it } from 'vitest'
import { canShareFile } from './downloadPng'

const file = new File(['png'], 'schedule.png', { type: 'image/png' })
const share = async () => {}

describe('canShareFile', () => {
  it('[TC-RH6Q] is true when the browser can share the file', () => {
    expect(canShareFile(file, { share, canShare: () => true })).toBe(true)
  })

  it('[TC-QGYR] is false when the browser has no share', () => {
    expect(canShareFile(file, {})).toBe(false)
  })

  it('[TC-QGYR] is false when the browser has no canShare', () => {
    expect(canShareFile(file, { share })).toBe(false)
  })

  it('[TC-QGYR] is false when the browser cannot share files', () => {
    expect(canShareFile(file, { share, canShare: () => false })).toBe(false)
  })
})
