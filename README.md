# donut

Azure Functions implementation of a Bits of Good Slackbot, managing donut dates.

## Setup / Contributing

## Directory Layout

Each base directory corresponds to an Azure Function. An Azure Function is a block of serverless Function as a Service (FaaS) code, which is essentially a stateless function in the cloud that only takes computing power when it is called. See the Functions section below for more information.

Other directories:

* db: The database. See database below for more information
* .vscode: azure in vscode setup
* .github: pipelines

## Database

MongoDB (CosmosDB on Azure) database backend. No Mongoose used, only pure mongodb schema validations. Collections:

* `channels`: The channels that the bot is registered in
    * `_id`
    * `workspaceId`: slack id of the workspace
    * `channelId`: slack id of the channel.
    * `pollingDay`: day to poll pairings
    * `pairingDay`: day to pair people
    * `endDate`: date to stop pairings
    * `weeks`: number of weeks to conduct pairings in this channel 
* `jobs`: The outstanding pairing messages that have yet to be resolved
    * `_id`
    * `workspaceId`: id of the workspace
    * `messageId`: id of the original pairing message sent
    * `channelId`: id of the channel the original pairing message was sent in


## Functions:

### PollChannels (TimerTrigger)

This function triggers daily at 9am EST. This will send a message into all of the channels who are scheduled for donut dates during this time. A job will be created, noting down the id of the message.

Additionally, this function will query for all outstanding jobs, checking to see who reacted to the pairing message and sending a message of the created pairs into the channel.

The job is then deleted off the database.

### Slack (HTTP Trigger)

This function is the normal handler for all Slack events. The way that Slack bots typically work is through a listener format -- e.g. "listen for the message 'hello' and do something; listen for a slash command and do something, etc.".

There are only a number of things that we need to listen to currently:

1. Adding the bot into a channel: This will register the bot and create a document in the channels collection. Sends a message acknowledging or not acknowledging successful registration.
2. Removing the bot from a channel: This is the opposite of (1). This removes the channel from the db, eliminates all jobs, and sends a message acknowledging successful removal.
3. Home modal interaction: This will be where the configuration for each of the channels will exist. Whenever someone opens the home modal, we must send back a response that paints the correct modals.

## Future Expansions

Custom times for pairing functions is possible with a TimerTrigger Azure Functions implementation (just run the function every 15/30/60 minutes instead of once daily), but it might be better/more cost effective to move to a event queue (Azure Queue Storage) or logic system (Azure Logic Apps) implementation. 

There are more complicated versions of BoG slackbots floating around (see https://github.com/hack4impact/slack-bot), and the original implementation was centered around scalability and the potential to add a lot of different plugins to a single bot.

Such an implementation is simple to set up in the `Slack` directory, but more requirements are needed to justify a more complicated implementation.
