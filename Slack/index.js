const { App } = require('@slack/bolt');
const { registerChannel, unregisterChannel } = require('../db/channels');
const { AzureReceiver } = require('../utils/AzureReceiver')
const config = require('../utils/config');
const dateConfig = require('./date-config');

const azureReceiver = new AzureReceiver({
    signingSecret: config.slack.signingSecret
})

const app = new App({
    token: config.slack.botToken,
    signingSecret: config.slack.signingSecret,
    receiver: azureReceiver,
})

app.event('member_joined_channel', async({ event, client, logger }) => {
    try {
        // get the user_id and bot_id of the bot user and bot. todo: move to util
        const { user_id, bot_id } = await client.auth.test()
        // if a bot didn't call this (impossible but just in case) 
        // or the joined user isn't equal to the bot user, then skip
        if (!bot_id || event.user !== user_id ) return

        // the joined user is the bot, add the channel to the db and acknowledge that the addition was successful
        const ack = await registerChannel({
            channelId: event.channel,
            workspaceId: event.team,
        })

        // message
        const result = await client.chat.postMessage({
          channel: event.channel,
          text: ack ? `I am here! 🎉 Go configure donut dates by using the /date-config command` : 'fail'
        });
    }
    catch (error) {
        logger.error(error);
    }
})

app.event('channel_left', async({ event, client, logger }) => {
    try {
        // This event only ever is triggered when the bot itself leaves
        const ack = await unregisterChannel({ channelId: event.channel })

        // send a message announcing that messages are gone
        const result = await client.chat.postMessage({
          channel: event.channel,
          text: ack ? `I have been removed from the channel! 🎉 All future donut dates for this channel have been cancelled.` : 'failed removal'
        });
    }
    catch (error) {
        logger.error(error);
    }
})

dateConfig(app)

// Listen for users opening your App Home
app.event('app_home_opened', async ({ event, client, logger }) => {
    try {
        // Call views.publish with the built-in client
        const result = await client.views.publish({
        // Use the user ID associated with the event
        user_id: event.user,
        view: {
            // Home tabs must be enabled in your app configuration page under "App Home"
            "type": "home",
            "blocks": [
            {
                "type": "section",
                "text": {
                "type": "mrkdwn",
                "text": "*Welcome home, <@" + event.user + "> :house:*"
                }
            },
            {
                "type": "section",
                "text": {
                "type": "mrkdwn",
                "text": "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>."
                }
            }
            ]
        }
        });
    
        logger.info(result);
    }
    catch (error) {
        logger.error(error);
    }
    });

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const handler = await azureReceiver.start()
    const res = await handler(req, undefined, undefined)
    context.res = res;
}