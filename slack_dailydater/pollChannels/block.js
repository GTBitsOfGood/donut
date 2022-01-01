const { randomHeartEmoji } = require('../../utils/utils')

const pollMessageBlock = (pollDate, pairDate, emoji) => {
    let sticker = 'doughnut'
    let dateDescriptor = 'Donut'
    if (emoji) {
        sticker = emoji
        dateDescriptor = emoji.charAt(0).toUpperCase() + emoji.slice(1)
    }
    return [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `:${sticker}:  ${dateDescriptor} Date Polling!  :${sticker}: `,
            },
        },
        {
            type: 'context',
            elements: [
                {
                    text: `Polling Date: *${pollDate}*  |  Pairing Date: *${pairDate}*`,
                    type: 'mrkdwn',
                },
            ],
        },
        {
            type: 'divider',
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `${randomHeartEmoji()} React to this message to join this week's round of dates! The deadline to react will be the above pairing date at 9am Eastern.`,
                verbatim: false,
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: ':robot_face: Have a suggestion for the bot or find a bug? Submit an issue <https://github.com/GTBitsOfGood/donut|on the GitHub here>.',
                },
            ],
        },
    ]
}

module.exports = pollMessageBlock
