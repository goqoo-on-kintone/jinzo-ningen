const { formatToTimeZone, parseFromTimeZone } = require('date-fns-timezone')

// see: https://stackoverflow.com/a/44096051/8778462
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const formatLocalDate = (date, format) => {
  return formatToTimeZone(date, format, { timeZone })
}

const parseLocalDateString = dateString => {
  return parseFromTimeZone(dateString, { timeZone })
}

module.exports = {
  formatLocalDate,
  parseLocalDateString,
}
