const { findJobsToBePaired } = require('../../db/jobs')
const config = require('../../utils/config')
const { postSlackBlockMessage, shuffleArray } = require('../../utils/utils')
const { failedPairingBlock, pairingBlock } = require('./blocks')

/**
 * Pairs all outstanding jobs scheduled for a day
 * @param {*} app
 * @param {*} day
 */
const pairJobs = async (app, day) => {
    const jobsToBePaired = await findJobsToBePaired(day)
    jobsToBePaired.forEach((job) => pair(app, job))
}

/**
 * Pairs the people who reacted to a polling message associated with given job
 * @param {*} job
 */
const pair = async (app, job) => {
    // 1. Find everyone who reacted to the message
    const {
        message: { reactions },
        channel,
    } = await app.client.reactions.get({
        token: config.slack.botToken,
        timestamp: job.messageTimestamp,
        channel: job.channelId,
    })

    const reactedUsers = new Set()
    reactions.forEach((r) => {
        r.users.forEach((u) => reactedUsers.add(u))
    })

    // 2. Send the pairing message
    if (reactedUsers.size <= 1) {
        await postSlackBlockMessage(app, channel, failedPairingBlock())
        return
    }
    const randomOrdering = shuffleArray(Array.from(reactedUsers))
    await postSlackBlockMessage(app, channel, pairingBlock(randomOrdering))
}

module.exports = pairJobs
