const { App } = require('@slack/bolt')
const { deleteTodaysJobs } = require('../db/jobs')
const config = require('../utils/config')
const pairJobs = require('./pairJobs')
const pollChannels = require('./pollChannels')

const app = new App({
    signingSecret: config.slack.signingSecret,
    token: config.slack.botToken,
})

module.exports = async function () {
    const timeStamp = new Date().toISOString()
    const cleanedDay = new Date(timeStamp.split('T')[0])

    // todo: wrap in a try catch block and throw errors within each method
    await pollChannels(app, cleanedDay)
    await pairJobs(app, cleanedDay)
    await deleteTodaysJobs(cleanedDay)

    // if (myTimer.isPastDue)
    // {
    //     context.log('JavaScript is running late!');
    // }
    // context.log('JavaScript timer trigger function ran!', timeStamp);
}
