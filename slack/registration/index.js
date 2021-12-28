const { registerChannel, unregisterChannel } = require('../../db/channels')
const { registrationBlock, unregisterBlock } = require('./blocks')

const setupRegistration = (app) => {
    app.event('member_joined_channel', async ({ event, client, logger }) => {
        try {
            await register(event, client)
        } catch (error) {
            logger.error(error)
        }
    })

    app.event('channel_left', async ({ event, client, logger }) => {
        try {
            await unregister(event, client)
        } catch (error) {
            logger.error(error)
        }
    })
}

const register = async (event, client) => {
    const { user_id, bot_id } = await client.auth.test()
    if (!bot_id || event.user !== user_id) return
    // the joined user is the bot, add the channel to the db and acknowledge that the addition was successful
    const ack = await registerChannel({
        channelId: event.channel,
        workspaceId: event.team,
    })
    // message
    await client.chat.postMessage({
        channel: event.channel,
        blocks: ack ? registrationBlock() : undefined,
        text: ack
            ? `Donut Dates have been added to this channel! Configure me using the /date-config command!`
            : 'Something went wrong when registering this channel. Please try readding me again later.',
    })
}

const unregister = async (event, client) => {
    // This event only ever is triggered when the bot itself leaves
    const ack = await unregisterChannel({ channelId: event.channel })

    // send a message announcing that messages are gone
    await client.chat.postMessage({
        channel: event.channel,
        blocks: ack ? unregisterBlock() : undefined,
        text: ack
            ? `Donut Dates have been removed from this channel!`
            : 'Something went wrong when removing this channel. Please try readd and remove me later.',
    })
}

module.exports = setupRegistration
