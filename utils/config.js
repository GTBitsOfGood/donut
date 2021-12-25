require('dotenv').config()

module.exports = {
    db: {
        name: process.env.DB_NAME,
        uri: process.env.DB_URI,
    },
    slack: {
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        botToken: process.env.SLACK_BOT_TOKEN,
        appId: process.env.SLACK_APP_ID,
    },
}