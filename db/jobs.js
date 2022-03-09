const mongo = require('./index')

const makeJob = async ({ workspaceId, channelId, messageTimestamp, pairingDate }) => {
    const db = await mongo()
    const { acknowledged } = await db.collection('jobs').insertOne({
        workspaceId,
        channelId,
        messageTimestamp,
        pairingDate,
    })
    return acknowledged
}

const findJobsToBePaired = async (day) => {
    const db = await mongo()
    const cleanedDay = new Date(day.toISOString().split('T')[0])
    const result = await db.collection('jobs').find({ pairingDate: cleanedDay }).toArray()
    return result
}

const deleteTodaysJobs = async (day = new Date()) => {
    const db = await mongo()
    const cleanedDay = new Date(day.toISOString().split('T')[0])
    const { acknowledged } = await db.collection('jobs').deleteMany({ pairingDate: { $lte: cleanedDay } })
    return acknowledged
}

const findChannelJob = async (channelId) => {
    const db = await mongo()
    const result = await db.collection('jobs').findOne({ channelId })
    return result
}

module.exports = {
    makeJob,
    findJobsToBePaired,
    deleteTodaysJobs,
    findChannelJob,
}
