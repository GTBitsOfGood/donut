const { randomHeartEmoji } = require('../../utils/utils')

const failedPairingBlock = () => [
    {
        type: 'section',
        text: {
            type: 'plain_text',
            text: 'Not enough people reacted to make pairings :cry:',
            emoji: true,
        },
    },
]

const pairingBlock = (persons) => {
    let pairsText = ''
    for (let i = 0; i < persons.length - 1; i += 2) {
        if (i !== 0) pairsText += '\n'
        pairsText += `• <@${persons[i]}> <> <@${persons[i + 1]}>`
    }
    if (persons.length % 2 !== 0) pairsText += ` <> <@${persons[persons.length - 1]}>`
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '*Here are the pairings for the week:*',
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'plain_text',
                    text: `${randomHeartEmoji()} Thanks for reacting!`,
                    emoji: true,
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
                text: pairsText,
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'plain_text',
                    text: ':camera: Remember to send a picture of your meetup in this channel for points!',
                    emoji: true,
                },
            ],
        },
    ]
}

module.exports = {
    failedPairingBlock,
    pairingBlock,
}
