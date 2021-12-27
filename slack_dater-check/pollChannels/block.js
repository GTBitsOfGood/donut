const { randomHeartEmoji } = require('../../utils/utils')

const pollMessageBlock = (pollDate, pairDate) => [
    {
        type: 'header',
        text: {
            type: 'plain_text',
            text: ':doughnut:  Donut Date Polling!  :doughnut: ',
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

module.exports = pollMessageBlock
