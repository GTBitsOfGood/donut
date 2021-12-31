const addPin = async (app, channel, timestamp, token) =>
    await app.client.pins.add({
        token,
        channel,
        timestamp,
    })

const removeAllPins = async (app, channel, token) => {
    const { items } = await app.client.pins.list({
        token,
        channel,
    })
    const unpinPromises = []
    for (let i = 0; i < items.length; i++) {
        const timestamp = items[i].message ? items[i].message.ts : items[i].file.timestamp
        unpinPromises.push(
            app.client.pins.remove({
                token,
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
