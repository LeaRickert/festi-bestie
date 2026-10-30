// YouTube links for the act sheet (act-sheet FR-3, FR-4). The app stores only
// the video id; every URL is built here.

export const watchUrl = (videoId: string): string => `https://www.youtube.com/watch?v=${videoId}`

export const searchUrl = (artist: string): string =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} live set`)}`
