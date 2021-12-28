const { App } = require('@slack/bolt')
const { AzureReceiver } = require('../utils/AzureReceiver')
const config = require('../utils/config')
const dateConfig = require('./date-config')
const dateStatus = require('./date-status')
const appHome = require('./home')
const registration = require('./registration')

const azureReceiver = new AzureReceiver({
    signingSecret: config.slack.signingSecret,
})

const app = new App({
    token: config.slack.botToken,
    signingSecret: config.slack.signingSecret,
    receiver: azureReceiver,
})

registration(app)
dateConfig(app)
dateStatus(app)
appHome(app)

module.exports = async function (context, req) {
    const handler = await azureReceiver.start()
    const res = await handler(req)
    context.res = res
}
