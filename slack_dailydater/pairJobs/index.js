const { findJobsToBePaired } = require('../../db/jobs')
const { fetchInstallation } = require('../../db/tokens')
const { removeAllPins, addPin } = require('../../utils/pins')
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
    // 0. Get the token for this workspace's bot
    const installation = await fetchInstallation({ teamId: job.workspaceId })
    const bot_token = installation.bot.token

    // 1. Find everyone who reacted to the message
    const {
        message: { reactions },
        channel,
    } = await app.client.reactions.get({
        token: bot_token,
        timestamp: job.messageTimestamp,
        channel: job.channelId,
    })

    const reactedUsers = new Set()
    if (reactions) {
        // check for 0 reactions
        reactions.forEach((r) => {
            r.users.forEach((u) => reactedUsers.add(u))
        })
    }

    // 2. Send the pairing message
    await removeAllPins(app, channel, bot_token)
    if (reactedUsers.size <= 1) {
        await postSlackBlockMessage(app, channel, failedPairingBlock(), {
            text: 'There are no dates for this week :cry:',
            token: bot_token,
        })
        return
    }
    const randomOrdering = shuffleArray(Array.from(reactedUsers))
    const { ts } = await postSlackBlockMessage(app, channel, pairingBlock(randomOrdering), {
        text: 'Pairs have been made for this cycle! Check Slack to see yours!',
        token: bot_token,
    })
    await addPin(app, channel, ts, bot_token)
}

module.exports = pairJobs
