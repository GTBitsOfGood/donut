const { findChannel, updateChannel } = require('../../db/channels')
const dateConfigBlock = require('./block')

const dateConfig = (app) => {
    const COMMON_MODAL_VIEW_PROPS = {
        type: 'modal',
        callback_id: 'date-config_modal',
        title: {
            type: 'plain_text',
            text: 'Dater Configuration',
        },
        submit: {
            type: 'plain_text',
            text: 'Submit',
        },
    }
    app.action('date-config_action', async ({ ack, logger, body, client }) => {
        await ack()
        try {
            const formData = recoverFormData(body.view)
            const [, name] = recoverPrivateMetadata(body.view.private_metadata)
            await client.views.update({
                view_id: body.view.id,
                hash: body.view.hash,
                view: {
                    ...COMMON_MODAL_VIEW_PROPS,
                    blocks: dateConfigBlock(name, formData),
                    private_metadata: body.view.private_metadata,
                },
            })
        } catch (error) {
            logger.error(error)
        }
    })

    app.command('/date-config', async ({ command, client, body, ack, respond, logger }) => {
        await ack()
        // check to see if the bot is registered
        const registration = await findChannel({ channelId: command.channel_id })
        if (!registration) {
            const { user_id } = await client.auth.test()
            respond(
                `I haven't been registered in this channel yet. Please add (or readd) <@${user_id}> to this channel to begin setting up dates for this channel. You can add me by clicking <@${user_id}> -> 'Add this app to a channel ...'.`,
            )
            return
        }
        try {
            const {
                channel: { name },
            } = await client.conversations.info({ channel: command.channel_id })
            // Call views.open with the built-in client
            await client.views.open({
                trigger_id: body.trigger_id,
                view: {
                    ...COMMON_MODAL_VIEW_PROPS,
                    blocks: dateConfigBlock(name, registration),
                    private_metadata: `${command.channel_id},${name}`,
                },
            })
        } catch (error) {
            logger.error(error)
        }
    })
    app.view('date-config_modal', async ({ ack, view }) => {
        await ack()
        const formData = recoverFormData(view)
        // eslint-disable-next-line no-unused-vars
        const [channelId, _] = recoverPrivateMetadata(view.private_metadata)
        await updateChannel(channelId, formData)
        // todo: feedback flow here
    })
}

const recoverFormData = (view) => {
    const getBlock = (blockId) => view['state']['values'][blockId]['date-config_action']
    const pollingDay = parseInt(getBlock('polling_day')['selected_option'].value)
    const pairingDay = parseInt(getBlock('pairing_day')['selected_option'].value)
    const frequency = parseInt(getBlock('frequency')['selected_option'].value)
    const endDate = new Date(getBlock('enddate')['selected_date'])
    return { pollingDay, pairingDay, frequency, endDate }
}

/**
 * Comma separated string of metadata. For now, expected to be [channelId, name]
 * @param {*} metadata metadata
 * @returns array of parsed metadata
 */
const recoverPrivateMetadata = (metadata) => metadata.split(',')

module.exports = dateConfig
