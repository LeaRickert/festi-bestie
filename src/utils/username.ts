// The username rule (auth FR-10). The database checks the same rule in
// public.check_username(), so keep the two in step.

export const USERNAME_MAX = 20

// Letters A-Z, digits and single spaces between them.
const USERNAME_PATTERN = /^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/

// The form shows this error; the database raises the same text.
export const USERNAME_RULE = 'Use up to 20 letters (A-Z), numbers and single spaces'

// Returns the error for a trimmed username, or null when it is valid.
export function usernameError(username: string): string | null {
  if (username === '') return 'Choose a username'
  if (username.length > USERNAME_MAX || !USERNAME_PATTERN.test(username)) return USERNAME_RULE
  return null
}
