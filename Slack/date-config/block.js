const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const daysToOptions = DAYS.map((day, i) => {
    return {
        "text": {
            "type": "plain_text",
            "text": day,
            "emoji": true
        },
        "value": i.toString()
    }
})
const FREQS = ['Weekly (1)', 'Biweekly (2)', 'Triweekly (3)']
const freqsToOptions = FREQS.map((freq, i) => {
    return {
        "text": {
            "type": "plain_text",
            "text": freq,
            "emoji": true
        },
        "value": (i+1).toString()
    }
})

const dateConfigBlock = (channelName, { pollingDay = 1, pairingDay = 3, frequency = 1, endDate = new Date() } = {} ) => {
    const parsedDate = endDate.toISOString().split('T')[0]
    return [
        {
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": `Editing configuration for #${channelName}`,
				"emoji": true
			}
		},
        {
            "type": "section",
            "block_id": "polling_day",
            "text": {
                "type": "mrkdwn",
                "text": "Pick a day to poll for daters."
            },
            "accessory": {
                "type": "static_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Polling Date (Required)",
                    "emoji": true
                },
                "initial_option": daysToOptions[pollingDay],
                "options": daysToOptions,
                "action_id": "date-config_action"
            }
        },
        {
            "type": "section",
            "block_id": "pairing_day",
            "text": {
                "type": "mrkdwn",
                "text": "Pick a day to make date pairings."
            },
            "accessory": {
                "type": "static_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Pairing Day (Required)",
                    "emoji": true
                },
                "initial_option": daysToOptions[pairingDay],
                "options": daysToOptions,
                "action_id": "date-config_action"
            }
        },
        {
            "type": "section",
            "block_id": "frequency",
            "text": {
                "type": "mrkdwn",
                "text": "Pick a frequency to send dates."
            },
            "accessory": {
                "type": "static_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select an item",
                    "emoji": true
                },
                "initial_option": freqsToOptions[frequency-1],
                "options": freqsToOptions,
                "action_id": "date-config_action"
            }
        },
        {
            "type": "section",
            "block_id": "enddate",
            "text": {
                "type": "mrkdwn",
                "text": "When should the bot stop making pairings?"
            },
            "accessory": {
                "type": "datepicker",
                "initial_date": parsedDate,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a date",
                    "emoji": true
                },
                "action_id": "date-config_action"
            }
        }
    ]
}

module.exports = dateConfigBlock