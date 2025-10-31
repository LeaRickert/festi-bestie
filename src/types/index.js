/**
 * @typedef {Object} Festival
 * @property {string} id
 * @property {string} name
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} location
 * @property {string} image
 * @property {string} [description]
 * @property {'announced'|'lineup'|'stages'|'schedule'|'times'|'complete'} status
 */

/**
 * @typedef {Object} Act
 * @property {string} id
 * @property {string} artist
 * @property {string} festivalId
 * @property {string} [day]
 * @property {string} [startTime]
 * @property {number} [length]
 * @property {string} [stage]
 * @property {string} [specialNotes]
 * @property {string} [genre]
 * @property {string} [category]
 * @property {string} [youtubeUrl]
 * @property {string} [youtubeTitle]
 * @property {number} [avgRating]
 */

/**
 * @typedef {Object} UserRating
 * @property {string} id
 * @property {string} userId
 * @property {string} actId
 * @property {number} rating
 * @property {string} createdAt
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} [name]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} FilterOptions
 * @property {string} [day]
 * @property {string} [stage]
 * @property {string} [genre]
 * @property {string} [category]
 * @property {Object} [timeRange]
 * @property {string} timeRange.start
 * @property {string} timeRange.end
 */

/**
 * @typedef {Object} SortOptions
 * @property {'artist'|'startTime'|'stage'|'genre'} field
 * @property {'asc'|'desc'} direction
 */
