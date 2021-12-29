const homeBlock = () => [
    {
        type: 'header',
        text: {
            type: 'plain_text',
            text: "Hello! I'm a Donut Date Bot!",
            emoji: true,
        },
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: "Hello! I'm a home-made <https://www.donut.com/|Donut Date> application, since that integration costs money. :moneybag: \n\nEvery week (or two or three!) I will poll any channel I've been added to for people who are interested in joining donut dates, then make pairs out of the people who have expressed interest.",
        },
    },
    {
        type: 'divider',
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: 'To configure Donut Dates for your channel, follow the steps below:',
        },
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: '>*1. Add me to a channel*.\nFor me to make pairings in a channel, I must be added to it first. To add me to a channel, click my icon above, then click `+ Add this app to a channel`. Alternatively, click my name here <> and click `Add this app to a channel...`',
        },
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: '>*2. Configure me using the `/date-config` command.*\nIn the channel you just added me to, use the `/date-config` command to pull up a modal that allows you to specify a _polling day_ (of the week), a _pairing day_ (of the week), a pairing frequency, and an end date.',
        },
    },
    {
        type: 'context',
        elements: [
            {
                type: 'mrkdwn',
                text: ':exclamation: The first poll will be sent during the next closest polling day. Polling and pairing will happen during the same week.\n:ballot_box_with_ballot: Users will opt into being paired by reacting to a polling message, sent on the polling day. \n:eyes: The pairs will be sent out on the pairing day. All messages are sent at 9am EST (14:00 UTC).\n:pushpin: *Warning:* The app will unpin *all* messages in a channel in order to keep active polling and pairing messages pinned.',
            },
        ],
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: ">*3. Check the status of the dater using the `/date-status` command.*\nTo verify the configuration of a channel or check when the next poll/pairing message will be sent, use this slash command in a channel that I've been added to.",
        },
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: '>*4. To stop all future pairings, remove me from the channel.*\nRemoving me from your channel will unregister your channel from all future donut dates and delete any outstanding pairing messages. You can always add me back!',
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
                text: ':question: Find any bugs, have any suggestions, or want to look at the source code? Take a look at <https://github.com/GTBitsOfGood/donut|the GitHub here>.\n:robot_face: This app was created by <https://github.com/Fattimo|Matt Chen> of <https://bitsofgood.org/|Bits of Good Georgia Tech>',
            },
        ],
    },
]

module.exports = homeBlock
