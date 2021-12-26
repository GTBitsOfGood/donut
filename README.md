# donut

Azure Functions implementation of a Bits of Good Slackbot, managing donut dates.

## Setup / Contributing

Node 14 recommended. NPM over yarn as Functions depends on package-lock. Install packages first. Local mongodb with docker recommended.

```
npm install
```

To set up a local development environment, we must tunnel slack channels into our local device. If you're using VSCode, open up two terminals, one to start the Azure Functions, and the other to expose our local machine to an internet URL.

```
npm run start
```

```
npm local 
```

The second command will give you a URL that tunnels HTTP requests to your local device. Copy this URL and paste it into the app manifest everywhere you see a URL:

Now, Slack should be listening to requests and sending those to your local device.

It is best to keep all testing onto a separate test free Slack channel, so the H4I Slack remains non-buggy.

Make a copy of the local.settings.json file and fill in the empty fields with the proper Slack env variables, found on the bot page. These variables are automatically loaded into the environment on launch.

## Directory Layout

Each base directory corresponds to an Azure Function. An Azure Function is a block of serverless Function as a Service (FaaS) code, which is essentially a stateless function in the cloud that only takes computing power when it is called. See the Functions section below for more information.

Other directories:

* db: The database. See database below for more information
* .vscode: azure in vscode setup
* .github: pipelines
* util: AzureReceiver, env loading, and random functions

## Database

MongoDB (CosmosDB on Azure) database backend. No Mongoose used, only pure mongodb schema validations. Collections:

* `channels`: The channels that the bot is registered in
    * `_id`
    * `workspaceId`: slack id of the workspace
    * `channelId`: slack id of the channel
    * `pollingDay`: day to poll pairings
    * `pairingDay`: day to pair people
    * `nextPollingDate`: date for next day of polls
    * `endDate`: date to stop polling
    * `frequency`: number representing weeks between pairings in this channel (i.e. 1 represents weekly pairings, 2 represents biweekly, etc.)
* `jobs`: The outstanding pairing messages that have yet to be resolved
    * `_id`
    * `workspaceId`: id of the workspace
    * `messageTimestamp`: timestamp of the original pairing message sent, used for slack's API
    * `channelId`: id of the channel the original pairing message was sent in
    * `pairingDate`: date which pairings for this job will be made.


## Functions:

### pollChannels (TimerTrigger)

This function triggers daily at 9am EST. This will send a message into all of the channels who are scheduled for donut dates during this time. A job will be created, noting down the id of the message. The nextPollingDates are updated to reflect the next polling day.

Additionally, this function will query for all outstanding jobs, checking to see who reacted to the pairing message and sending a message of the created pairs into the channel.

The jobs for that day are then deleted off the database.

### slack (HTTP Trigger)

This function is the normal handler for all Slack events. The way that Slack bots typically work is through a listener format -- e.g. "listen for the message 'hello' and do something; listen for a slash command and do something, etc.".

There are only a number of things that we need to listen to currently:

1. Adding the bot into a channel: This will register the bot and create a document in the channels collection. Sends a message acknowledging or not acknowledging successful registration.
2. Removing the bot from a channel: This is the opposite of (1). This removes the channel from the db, eliminates all jobs, and sends a message acknowledging successful removal.
3. Home modal interaction: This will be where instructions for bot use need to be made.
4. /date-config: This slash command configures a date bot for the given channel it is called in.

## Future Expansions

Custom times for pairing functions is possible with a TimerTrigger Azure Functions implementation (just run the function every 15/30/60 minutes instead of once daily), but it might be better/more cost effective to move to a event queue (Azure Queue Storage) or logic system (Azure Logic Apps) implementation. From a user perspective, it's already kind of annoying to set days, so its probably better just not implement custom times.

There are more complicated versions of BoG slackbots floating around (see https://github.com/hack4impact/slack-bot), and the original implementation was centered around scalability and the potential to add a lot of different plugins to a single bot.

Such an implementation is simple to set up in the `Slack` directory, but more requirements are needed to justify a more complicated implementation.
