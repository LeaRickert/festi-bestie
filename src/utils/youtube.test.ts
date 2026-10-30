import { describe, expect, it } from 'vitest'
import { searchUrl, watchUrl } from './youtube'

describe('youtube', () => {
  it('[TC-FR7I] links to the video on YouTube', () => {
    expect(watchUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })

  it('[TC-RBKH] searches YouTube for "[artist] live set"', () => {
    expect(searchUrl('Sota')).toBe('https://www.youtube.com/results?search_query=Sota%20live%20set')
    expect(searchUrl('Above & Beyond')).toBe(
      'https://www.youtube.com/results?search_query=Above%20%26%20Beyond%20live%20set',
    )
  })
})
