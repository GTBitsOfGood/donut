const { registerChannel, unregisterChannel } = require('../../db/channels')

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
        text: ack ? `I am here! 🎉 Go configure donut dates by using the /date-config command` : 'fail',
    })
}

const unregister = async (event, client) => {
    // This event only ever is triggered when the bot itself leaves
    const ack = await unregisterChannel({ channelId: event.channel })

    // send a message announcing that messages are gone
    await client.chat.postMessage({
        channel: event.channel,
        text: ack
            ? `I have been removed from the channel! 🎉 All future donut dates for this channel have been cancelled.`
            : 'failed removal',
    })
}

module.exports = setupRegistration
