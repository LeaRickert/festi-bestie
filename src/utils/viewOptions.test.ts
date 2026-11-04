import { describe, expect, it } from 'vitest'
import { getGenreOptions, matchesGenre, resolveGenre, viewCaption } from './viewOptions'

describe('getGenreOptions', () => {
  it('[TC-SAHI] lists the distinct genres of the acts, sorted, with no empty value', () => {
    const acts = [{ category: 'House' }, { category: 'Bass' }, { category: null }, { category: 'House' }]
    expect(getGenreOptions(acts)).toEqual(['Bass', 'House'])
  })
})

describe('resolveGenre', () => {
  it('[TC-D2AS] treats an unknown genre as no filter', () => {
    expect(resolveGenre('Polka', ['Bass', 'House'])).toBeNull()
  })

  it('[TC-D2AS] keeps a known genre and treats a missing one as no filter', () => {
    expect(resolveGenre('House', ['Bass', 'House'])).toBe('House')
    expect(resolveGenre(null, ['Bass', 'House'])).toBeNull()
  })
})

describe('matchesGenre', () => {
  it('[TC-EPJ1] does not match an act with no genre when a genre is chosen', () => {
    expect(matchesGenre({ category: null }, 'House')).toBe(false)
  })

  it('[TC-J33P] matches only the chosen genre, and every act with no filter', () => {
    expect(matchesGenre({ category: 'House' }, 'House')).toBe(true)
    expect(matchesGenre({ category: 'Bass' }, 'House')).toBe(false)
    expect(matchesGenre({ category: 'Bass' }, null)).toBe(true)
    expect(matchesGenre({ category: null }, null)).toBe(true)
  })
})

describe('viewCaption', () => {
  it('[TC-KPGZ] names the color mode, the source and the genre', () => {
    expect(viewCaption({ mode: 'heatmap', genre: 'House' })).toBe('Heatmap · Global · House only')
  })

  it('[TC-F2KU] names only the genre in "My picks"', () => {
    expect(viewCaption({ mode: 'picks', genre: 'House' })).toBe('House only')
  })

  it('[TC-CCDC] is empty for the default view', () => {
    expect(viewCaption({ mode: 'picks', genre: null })).toBeNull()
  })
})
