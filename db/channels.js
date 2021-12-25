const { getNextDay } = require('../utils/utils')
const mongo = require('./index')

const registerChannel = async ({
    workspaceId,
    channelId,
    pollingDay = '1',
    pairingDay = '3',
    frequency = 1
}) => {
    const db = await mongo()
    const { acknowledged } = await db.collection('channels').insertOne({
        workspaceId,
        channelId,
        pollingDay,
        pairingDay,
        frequency,
        endDate: new Date()
    })
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

// updatedDocument: { pollingDay, pairingDay, frequency, endDate }
const updateChannel = async (channelId, updatedDocument, logger) => {
    const db = await mongo()
    const { endDate, pollingDay } = updatedDocument
    const nextPollingDate = getNextDay(new Date(), pollingDay)
    logger.info(nextPollingDate)
    updatedDocument = {
        ...updatedDocument,
        nextPollingDate: nextPollingDate > endDate ? null : nextPollingDate
    }
    const { acknowledged } = await db.collection('channels').updateOne({ channelId }, { $set: updatedDocument })
    return acknowledged
}

const findChannelsToBePolled = async day => {
    const db = await mongo()
    const cleanedDay = new Date(day.toISOString().split('T')[0]);
    const result = await db.collection('channels').find({ nextPollingDate: cleanedDay }).toArray()
    return result
}

const updateNextPollDate = async registration => {
    const db = await mongo()
    const { _id, frequency, nextPollingDate, endDate } = registration
    nextPollingDate.setDate(nextPollingDate.getDate() + frequency * 7)
    if (nextPollingDate > endDate) return true
    const { acknowledged } = await db.collection('channels').updateOne({ _id }, {
        $set: { nextPollingDate }
    })
    return acknowledged
}

module.exports = {
    registerChannel,
    unregisterChannel,
    findChannel,
    findChannelsToBePolled,
    updateChannel,
    updateNextPollDate
}