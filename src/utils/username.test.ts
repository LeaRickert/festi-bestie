import { describe, expect, it } from 'vitest'
import { USERNAME_RULE, usernameError } from './username'

describe('username rule (auth FR-10)', () => {
  it('[TC-B9AV] accepts letters, numbers and single spaces up to 20 characters', () => {
    expect(usernameError('DJ Lea 2')).toBeNull()
    expect(usernameError('a'.repeat(20))).toBeNull()
  })

  it('[TC-U52K] rejects a username of 21 characters', () => {
    expect(usernameError('a'.repeat(21))).toBe(USERNAME_RULE)
  })

  it('[TC-DJ6G] rejects other characters', () => {
    expect(usernameError('lea_b')).toBe(USERNAME_RULE)
    expect(usernameError('lea@test.local')).toBe(USERNAME_RULE)
  })

  it('[TC-K86H] rejects two spaces in a row', () => {
    expect(usernameError('DJ  Lea')).toBe(USERNAME_RULE)
  })

  it('[TC-DCCB] rejects an accented letter', () => {
    expect(usernameError('Zoë')).toBe(USERNAME_RULE)
  })

  it('[TC-11E0] asks for a username when it is empty', () => {
    expect(usernameError('')).toBe('Choose a username')
  })
})
