'use strict'
const logger_1 = require('@slack/logger')
const querystring_1 = require('querystring')
const crypto_1 = require('crypto')
const tsscmp_1 = require('tsscmp')
const errors_1 = require('@slack/bolt')
const oauth_1 = require('@slack/oauth')
/*
 * Receiver implementation for Azure functions apps
 */
class AzureReceiver {
    constructor({
        signingSecret,
        clientId,
        clientSecret,
        scopes = [],
        installationStore,
        stateSecret,
        logger = undefined,
        logLevel = logger_1.LogLevel.INFO,
        customPropertiesExtractor = () => ({}),
    }) {
        // Initialize instance variables, substituting defaults for each value
        this.signingSecret = signingSecret
        this.logger =
            logger !== null && logger !== void 0
                ? logger
                : (() => {
                      const defaultLogger = new logger_1.ConsoleLogger()
                      defaultLogger.setLevel(logLevel)
                      return defaultLogger
                  })()
        this.customPropertiesExtractor = customPropertiesExtractor
        // If OAuth, then create an Install Provider
        if (clientId !== undefined && clientSecret !== undefined) {
            const installUrlOptions = {
                scopes: scopes !== null && scopes !== void 0 ? scopes : [],
            }
            this.installer = new oauth_1.InstallProvider({
                clientId,
                clientSecret,
                installationStore,
                stateSecret,
                logger,
                logLevel,
            })
            this.installUrlOptions = installUrlOptions
        }
    }
    init(app) {
        this.app = app
    }
    start() {
        return new Promise((resolve, reject) => {
            try {
                const handler = this.toHandler()
                resolve(handler)
            } catch (error) {
                reject(error)
            }
        })
    }
    // eslint-disable-next-line class-methods-use-this
    stop() {
        return new Promise((resolve) => {
            resolve()
        })
    }
    toHandler() {
        return async (azureContext = {}, azureRequest) => {
            var _a
            this.logger.debug(`Azure event: ${JSON.stringify(azureRequest, null, 2)}`)
            const { rawBody } = azureRequest
            const body = this.parseRequestBody(
                rawBody,
                this.getHeaderValue(azureRequest.headers, 'Content-Type'),
                this.logger,
            )
            // ssl_check (for Slash Commands)
            if (
                typeof body !== 'undefined' &&
                body != null &&
                typeof body.ssl_check !== 'undefined' &&
                body.ssl_check != null
            ) {
                azureContext.res = { statusCode: 200, body: '' }
                return Promise.resolve(azureContext.res)
            }
            // request signature verification
            const signature = this.getHeaderValue(azureRequest.headers, 'X-Slack-Signature')
            const ts = Number(this.getHeaderValue(azureRequest.headers, 'X-Slack-Request-Timestamp'))
            if (!this.isValidRequestSignature(this.signingSecret, rawBody, signature, ts)) {
                azureContext.res = { statusCode: 401, body: '' }
                return Promise.resolve(azureContext.res)
            }
            // url_verification (Events API)
            if (
                typeof body !== 'undefined' &&
                body != null &&
                typeof body.type !== 'undefined' &&
                body.type != null &&
                body.type === 'url_verification'
            ) {
                azureContext.res = {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ challenge: body.challenge }),
                }
                return Promise.resolve(azureContext.res)
            }
            // Setup ack timeout warning
            let isAcknowledged = false
            setTimeout(() => {
                if (!isAcknowledged) {
                    this.logger.error(
                        'An incoming event was not acknowledged within 3 seconds. ' +
                            'Ensure that the ack() argument is called in a listener.',
                    )
                }
            }, 3001)
            // Structure the ReceiverEvent
            let storedResponse
            const event = {
                body,
                ack: async (response) => {
                    if (isAcknowledged) {
                        throw new errors_1.ReceiverMultipleAckError()
                    }
                    isAcknowledged = true
                    if (typeof response === 'undefined' || response == null) {
                        storedResponse = ''
                    } else {
                        storedResponse = response
                    }
                },
                retryNum: this.getHeaderValue(azureRequest.headers, 'X-Slack-Retry-Num'),
                retryReason: this.getHeaderValue(azureRequest.headers, 'X-Slack-Retry-Reason'),
                customProperties: this.customPropertiesExtractor(azureRequest),
            }
            // Send the event to the app for processing
            try {
                await ((_a = this.app) === null || _a === void 0 ? void 0 : _a.processEvent(event))
                if (storedResponse !== undefined) {
                    if (typeof storedResponse === 'string') {
                        azureContext.res = { statusCode: 200, body: storedResponse }
                        return azureContext.res
                    }
                    azureContext.res = {
                        statusCode: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(storedResponse),
                    }
                    return azureContext.res
                }
            } catch (err) {
                this.logger.error('An unhandled error occurred while Bolt processed an event')
                this.logger.debug(`Error details: ${err}, storedResponse: ${storedResponse}`)
                azureContext.res = { statusCode: 500, body: 'Internal server error' }
                return azureContext.res
            }
            azureContext.res = { statusCode: 404, body: '' }
            return azureContext.res
        }
    }
    // eslint-disable-next-line class-methods-use-this
    parseRequestBody(stringBody, contentType, logger) {
        if (contentType === 'application/x-www-form-urlencoded') {
            const parsedBody = querystring_1.parse(stringBody)
            if (typeof parsedBody.payload === 'string') {
                return JSON.parse(parsedBody.payload)
            }
            return parsedBody
        }
        if (contentType === 'application/json') {
            return JSON.parse(stringBody)
        }
        logger.warn(`Unexpected content-type detected: ${contentType}`)
        try {
            // Parse this body anyway
            return JSON.parse(stringBody)
        } catch (e) {
            logger.error(`Failed to parse body as JSON data for content-type: ${contentType}`)
            throw e
        }
    }
    // eslint-disable-next-line class-methods-use-this
    isValidRequestSignature(signingSecret, body, signature, requestTimestamp) {
        if (!signature || !requestTimestamp) {
            return false
        }
        // Divide current date to match Slack ts format
        // Subtract 5 minutes from current time
        const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5
        if (requestTimestamp < fiveMinutesAgo) {
            return false
        }
        const hmac = crypto_1.createHmac('sha256', signingSecret)
        const [version, hash] = signature.split('=')
        hmac.update(`${version}:${requestTimestamp}:${body}`)
        if (!tsscmp_1(hash, hmac.digest('hex'))) {
            return false
        }
        return true
    }
    // eslint-disable-next-line class-methods-use-this
    getHeaderValue(headers, key) {
        const caseInsensitiveKey = Object.keys(headers).find((it) => key.toLowerCase() === it.toLowerCase())
        return caseInsensitiveKey !== undefined ? headers[caseInsensitiveKey] : undefined
    }
}

module.exports = {
    AzureReceiver: AzureReceiver,
}
