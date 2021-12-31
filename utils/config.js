/* eslint-disable no-undef */
module.exports = {
    db: {
        name: process.env.DB_NAME,
        uri: process.env.DB_URI,
    },
    slack: {
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        botToken: process.env.SLACK_BOT_TOKEN, // not needed anymore with oauth
        appId: process.env.SLACK_APP_ID,
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        stateSecret: process.env.SLACK_STATE_SECRET,
        scopes: [
            'channels:read',
            'chat:write.customize',
            'chat:write',
            'reactions:read',
            'channels:join',
            'groups:read',
            'commands',
            'pins:read',
            'pins:write',
        ],
    },
}
