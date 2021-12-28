const registrationBlock = () => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: 'Hello! :wave: I am a donut date app! Before I can begin making pairings, please use the `/date-config` command to configure me. Read below for a quick explanation on how I work.',
        },
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: '*:ballot_box_with_ballot: Each cycle, a polling message and a pairing message will be sent into this channel.* The polling message is a message for users to react to in order to opt into being paired. The pairing message randomly pairs people who reacted together.',
        },
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: 'For more info, check out my home page by clicking me -> `About this app` -> `Home`.',
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
                text: 'TLDR:\n:eyes: Configure me with `/date-config`\n:question: Check upcoming messages in this channel with `/date-status`',
            },
        ],
    },
]

const unregisterBlock = () => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: 'Goodbye! :wave: I have been removed from the channel! All outstanding messages will no longer be sent.',
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
                text: 'If you ever want donut dates in this channel again (or any other channel), feel free to add me back!',
            },
        ],
    },
]

module.exports = {
    unregisterBlock,
    registrationBlock,
}
