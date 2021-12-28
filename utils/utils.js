const config = require('./config')

/**
 * returns date object of next day of the week. timezone automatically gmt 0
 * @param {Date} from the day calculated from
 * @param {number} day of the week, where 0 represents sunday and 6 represents saturday
 */
const getNextDay = (from = new Date(), day) => {
    from.setDate(from.getDate() + ((day + 7 - from.getDay()) % 7 || 7))
    return new Date(from.toISOString().split('T')[0])
}

/**
 * Durstenfeld shuffle
 * https://stackoverflow.com/a/12646864
 * @param {*} array array to be shuffled in place
 */
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

const postSlackBlockMessage = async (app, channel, blocks, options = {}) =>
    await app.client.chat.postMessage({
        token: config.botToken,
        channel,
        blocks,
        ...options,
    })

const randomHeartEmoji = () => {
    const COLORS = [
        'gift',
        'black',
        'white',
        'purple',
        'orange',
        'green',
        'yellow',
        'blue',
        'revolving',
        'sparkling',
        '',
    ]
    const random = COLORS[Math.floor(Math.random() * COLORS.length)]
    return random ? `:${random}_heart:` : ':heart:'
}

module.exports = {
    getNextDay,
    shuffleArray,
    postSlackBlockMessage,
    randomHeartEmoji,
}
