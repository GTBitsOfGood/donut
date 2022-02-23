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

const pairingBlock = (persons, pairLength = 2) => {
    let pairsText = ''
    let i = 0
    for (i; i < persons.length - 1; i += pairLength) {
        if (i !== 0) pairsText += '\n'
        pairsText += '• '
        for (let j = 0; j < pairLength - 1; j++) pairsText += `<@${persons[i + j]}> <> `
        pairsText += `<@${persons[i + 1]}>`
    }
    if (persons.length % pairLength == 1) pairsText += ` <> <@${persons[persons.length - 1]}>`
    else {
        pairsText += '\n'
        pairsText += '• '
        for (i -= pairLength; i < persons.length - 1; i++) pairsText += `<@${persons[i]}> <> `
        pairsText += `<@${persons[i + 1]}>`
    }
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
