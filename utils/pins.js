const config = require('./config')

const addPin = async (app, channel, timestamp) =>
    await app.client.pins.add({
        token: config.slack.botToken,
        channel,
        timestamp,
    })

const removeAllPins = async (app, channel) => {
    const { items } = await app.client.pins.list({
        token: config.slack.botToken,
        channel,
    })
    const unpinPromises = []
    for (let i = 0; i < items.length; i++) {
        const timestamp = items[i].message ? items[i].message.ts : items[i].file.timestamp
        unpinPromises.push(
            app.client.pins.remove({
                token: config.slack.botToken,
                channel,
                timestamp,
            }),
        )
    }
    const resolutions = await Promise.all(unpinPromises)
    return resolutions.some((r) => !r)
}

module.exports = {
    addPin,
    removeAllPins,
}
