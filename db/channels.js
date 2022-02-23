const { getNextDay } = require('../utils/utils')
const mongo = require('./index')

const setup = async () => {
    const db = await mongo()
    await db.collection('channels').createIndex({ channelId: 1 }, { unique: true })
}

setup()

const registerChannel = async ({ workspaceId, channelId, pollingDay = '1', pairingDay = '3', frequency = 1 }) => {
    const db = await mongo()
    const { acknowledged } = await db.collection('channels').updateOne(
        { channelId },
        {
            $set: {
                workspaceId,
                channelId,
                pollingDay,
                pairingDay,
                frequency,
                endDate: new Date(),
            },
        },
        { upsert: true },
    )
    return acknowledged
}

const unregisterChannel = async ({ channelId }) => {
    const db = await mongo()
    const { acknowledged } = await db.collection('channels').deleteOne({ channelId })
    await db.collection('jobs').deleteMany({ channelId })
    return acknowledged
}

const findChannel = async ({ channelId }) => {
    const db = await mongo()
    const result = await db.collection('channels').findOne({ channelId })
    return result
}

const findChannelById = async (_id) => {
    const db = await mongo()
    const result = await db.collection('channels').findOne({ _id })
    return result
}

// updatedDocument: { pollingDay, pairingDay, frequency, endDate, ...other fields }
const updateChannel = async (channelId, updatedDocument) => {
    const db = await mongo()
    const { endDate, pollingDay } = updatedDocument
    // offset because matches are made at utc and est is -5 hours
    const now = new Date()
    now.setHours(now.getHours() - 5)
    const nextPollingDate = getNextDay(now, pollingDay)
    updatedDocument = {
        ...updatedDocument,
        nextPollingDate: nextPollingDate > endDate ? null : nextPollingDate,
    }
    const { acknowledged } = await db.collection('channels').updateOne({ channelId }, { $set: updatedDocument })
    return acknowledged
}

const findChannelsToBePolled = async (day) => {
    const db = await mongo()
    const cleanedDay = new Date(day.toISOString().split('T')[0])
    const result = await db.collection('channels').find({ nextPollingDate: cleanedDay }).toArray()
    return result
}

const updateNextPollDate = async (registration) => {
    const db = await mongo()
    const { _id, frequency, nextPollingDate, endDate } = registration
    nextPollingDate.setDate(nextPollingDate.getDate() + frequency * 7)
    if (nextPollingDate > endDate) return true
    const { acknowledged } = await db.collection('channels').updateOne(
        { _id },
        {
            $set: { nextPollingDate },
        },
    )
    return acknowledged
}

module.exports = {
    registerChannel,
    unregisterChannel,
    findChannel,
    findChannelById,
    findChannelsToBePolled,
    updateChannel,
    updateNextPollDate,
}
