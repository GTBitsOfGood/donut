const homeBlock = require('./block')

const appHome = (app) => {
    app.event('app_home_opened', async ({ event, client, logger }) => {
        try {
            await client.views.publish({
                user_id: event.user,
                view: {
                    type: 'home',
                    blocks: homeBlock(),
                },
            })
        } catch (error) {
            logger.error(error)
        }
    })
}

module.exports = appHome
