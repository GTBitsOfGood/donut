const { App } = require('@slack/bolt')
const { installationStore } = require('../db/tokens')
const { AzureReceiver } = require('../utils/AzureReceiver')
const config = require('../utils/config')
const dateConfig = require('./date-config')
const dateStatus = require('./date-status')
const appHome = require('./home')
const registration = require('./registration')

const azureReceiver = new AzureReceiver({
    signingSecret: config.slack.signingSecret,
    clientId: config.slack.clientId,
    clientSecret: config.slack.clientSecret,
    scopes: config.slack.scopes,
    stateSecret: config.slack.stateSecret,
    installationStore,
})

const app = new App({
    signingSecret: config.slack.signingSecret,
    receiver: azureReceiver,
})

registration(app)
dateConfig(app)
dateStatus(app)
appHome(app)

module.exports = async function (context, req) {
    const handler = await azureReceiver.start()
    /* const res = */ await handler(context, req)
    // context.res = res // this is handled in the handler
}
