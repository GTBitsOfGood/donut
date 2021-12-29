const { findChannel } = require('../../db/channels')
const { findChannelJob } = require('../../db/jobs')

const dateStatus = (app) => {
    app.command('/date-status', async ({ client, command, ack, respond }) => {
        await ack()
        const registration = await findChannel({ channelId: command.channel_id })
        if (!registration) {
            const { user_id } = await client.auth.test()
            respond(
                `I haven't been registered in this channel yet. Please add (or readd) <@${user_id}> to this channel to begin setting up dates for this channel. You can add me by clicking <@${user_id}> -> 'Add this app to a channel ...'.`,
            )
            return
        }
        const job = await findChannelJob(command.channel_id)
        const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const pollingDay = DAYS[parseInt(registration.pollingDay)]
        const pairingDay = DAYS[parseInt(registration.pairingDay)]
        const nextPollingDate = registration.nextPollingDate
            ? registration.nextPollingDate.toISOString().split('T')[0]
            : 'N/A'
        const nextPairingDate = job ? job.pairingDate.toISOString().split('T')[0] : 'N/A'
        const cleansedEndDate = registration.endDate.toISOString().split('T')[0]
        respond(
            `This channel is registered, with a polling day of *${pollingDay}* and a pairing day of *${pairingDay}*. The next polling date is *${nextPollingDate}* and the next pairing day is *${nextPairingDate}*. Polls will occur every *${registration.frequency}* week(s) until *${cleansedEndDate}*.`,
        )
    })
}

module.exports = dateStatus
