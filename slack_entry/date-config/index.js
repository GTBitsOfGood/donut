const { findChannel, updateChannel } = require('../../db/channels')
const dateConfigBlock = require('./block')

const dateConfig = (app) => {
    app.action('date-config_action', async ({ ack }) => await ack())
    app.command('/date-config', async ({ command, client, body, ack, respond, logger }) => {
        await ack()
        // check to see if the bot is registered
        const registration = await findChannel({ channelId: command.channel_id })
        if (!registration) {
            const { user_id } = await client.auth.test()
            respond(
                `I haven't been registered in this channel yet. Please add (or readd) <@${user_id}> to this channel to begin setting up dates for this channel. You can add me by clicking on me -> 'Add this app to a channel ...'.`,
            )
            return
        }
        try {
            const {
                channel: { name },
            } = await client.conversations.info({ channel: command.channel_id })
            // Call views.open with the built-in client
            await client.views.open({
                // Pass a valid trigger_id within 3 seconds of receiving it
                trigger_id: body.trigger_id,
                // View payload
                view: {
                    type: 'modal',
                    // View identifier
                    callback_id: 'date-config_modal',
                    title: {
                        type: 'plain_text',
                        text: `Dater Configuration`,
                    },
                    blocks: dateConfigBlock(name, registration),
                    submit: {
                        type: 'plain_text',
                        text: 'Submit',
                    },
                    private_metadata: command.channel_id,
                },
            })
        } catch (error) {
            logger.error(error)
        }
    })
    app.view('date-config_modal', async ({ ack, view, logger }) => {
        await ack()
        const getBlock = (blockId) => view['state']['values'][blockId]['date-config_action']
        const pollingDay = parseInt(getBlock('polling_day')['selected_option'].value)
        const pairingDay = parseInt(getBlock('pairing_day')['selected_option'].value)
        const frequency = parseInt(getBlock('frequency')['selected_option'].value)
        const endDate = new Date(getBlock('enddate')['selected_date'])
        const channelId = view.private_metadata
        await updateChannel(channelId, { pollingDay, pairingDay, frequency, endDate }, logger)
        // todo: feedback flow here
    })
}

module.exports = dateConfig
