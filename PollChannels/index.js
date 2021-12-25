const { App } = require('@slack/bolt');
const { findChannelsToBePolled, updateNextPollDate } = require('../db/channels');
const { makeJob, findJobsToBePaired, deleteTodaysJobs } = require('../db/jobs');
const config = require('../utils/config');
const { getNextDay, shuffleArray } = require('../utils/utils');

const app = new App({
    signingSecret: config.slack.signingSecret,
    token: config.slack.botToken
})

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();
    const cleanedDay = new Date(timeStamp.split('T')[0])

    // check all of the registered channels for: nextPollingDate == today
    // send a polling message into all of those channels
    // update messages with next polling date
    // create a job for each of those messages
    const channelsToBePolled = await findChannelsToBePolled(cleanedDay)
    channelsToBePolled.forEach(async channel => {
        const { ok, ts } = await app.client.chat.postMessage({
            token: config.botToken,
            channel: channel.channelId,
            text: "polling message"
        })

        const pairingDate = getNextDay(new Date(), channel.pairingDay)
        
        const jobPromise = makeJob({
            workspaceId: channel.workspaceId, 
            channelId: channel.channelId,
            messageTimestamp: ts,
            pairingDate
        })

        const updatePollDatePromise = updateNextPollDate(channel)

        const acks = await Promise.all([jobPromise, updatePollDatePromise])
        if (acks.some(e=>!e)) context.log("something failed")
    })

    // check all jobs for pairing date == today
    // send a pairing message into all of those channels
    // delete the job
    const jobsToBePaired = await findJobsToBePaired(cleanedDay)
    jobsToBePaired.forEach(async job => {
        // get the reactions of message associated with the job
        const { ok, message: { reactions }, channel } = await app.client.reactions.get({
            token: config.slack.botToken,
            timestamp: job.messageTimestamp,
            channel: job.channelId
        })

        const reactedUsers = new Set()
        reactions.forEach(r => {
            r.users.forEach(u => reactedUsers.add(u))
        })
        let text = ''
        if (reactedUsers.size <= 1) {
            text += "There were not enough people to make pairings this week"
        } else {
            const randomOrdering = shuffleArray(Array.from(reactedUsers))
            // if its even, this will get all elements. if odd, then append to the very last one
            text += "Here are the pairings for this week:"
            for (let i = 0; i < randomOrdering.length-1; i+=2) {
                text += `\n• <@${randomOrdering[i]}> <> <@${randomOrdering[i+1]}>`
            }
            if (randomOrdering.length % 2 !== 0) text += ` <> <@${randomOrdering[randomOrdering.length-1]}>`
            text += "\nMessage your pair and send a picture of your donut date in this channel!"
        }
        const messageResult = await app.client.chat.postMessage({
            token:config.slack.botToken,
            channel,
            text,
        })
    })
    const ack = await deleteTodaysJobs()

    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);   
};