const { findChannelsToBePolled, updateNextPollDate } = require('../../db/channels')
const { makeJob } = require('../../db/jobs')
const { getNextDay, postSlackBlockMessage } = require('../../utils/utils')
const pollMessageBlock = require('./block')

/**
 * Polls all registered channels for the current day
 * @param {*} app Instance of the slack app
 * @param {*} day day string in the format "yyyy-mm-dd"
 */
const pollChannels = async (app, day) => {
    const channelsToBePolled = await findChannelsToBePolled(day)
    channelsToBePolled.forEach((channel) => poll(app, channel))
}

/**
 * Poll a channel:
 *  1. Sends a polling message into a channel
 *  2: Makes a job for the pairing date of that poll
 *  3. Updates the next poll date
 * @param {*} app
 * @param {*} channel
 */
const poll = async (app, channel) => {
    const pairingDate = getNextDay(new Date(), channel.pairingDay)
    const prettyPairingDate = pairingDate.toISOString().split('T')[0]
    const pollingDate = new Date().toISOString().split('T')[0]

    // 1. Send a polling message into the channel
    const { ts } = await postSlackBlockMessage(
        app,
        channel.channelId,
        pollMessageBlock(pollingDate, prettyPairingDate),
        {
            text: 'Donut Date polling message! React to join!',
        },
    )
    // 2. Make a job related to the outstanding poll
    const jobPromise = makeJob({
        workspaceId: channel.workspaceId,
        channelId: channel.channelId,
        messageTimestamp: ts,
        pairingDate,
    })
    // 3. Update the next poll date
    const updatePollDatePromise = updateNextPollDate(channel)

    await Promise.all([jobPromise, updatePollDatePromise])
}

module.exports = pollChannels
