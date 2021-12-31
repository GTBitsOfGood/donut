const { InstallProvider } = require('@slack/oauth')
const { installationStore } = require('../db/tokens')
const config = require('../utils/config')

const installer = new InstallProvider({
    clientId: config.slack.clientId,
    clientSecret: config.slack.clientSecret,
    installationStore,
    stateSecret: config.slack.stateSecret,
})

module.exports = async function (context, req) {
    if (req.query.install !== undefined || !req.query.code || !req.query.state) {
        const url = await installer.generateInstallUrl({ scopes: config.slack.scopes }, true)
        context.res = { statusCode: 302, headers: { ...context.res.headers, Location: url } }
        return
    }
    context.res.writeHead = (status, headers) => {
        context.res.status = status
        context.res.headers = { ...context.res.headers, ...headers }
    }
    context.res.end = (body) => {
        context.res.body = body
    }
    await installer.handleCallback(req, context.res)
}
