"use strict";
const logger_1 = require("@slack/logger");
const forge_1 = require("node-forge")
const tsscmp_1 = require("tsscmp");
const errors_1 = require("@slack/bolt");
/*
 * Receiver implementation for Azure functions apps
 */
class AzureReceiver {
    constructor({ signingSecret, logger = undefined, logLevel = logger_1.LogLevel.INFO, customPropertiesExtractor = (_) => ({}), }) {
        // Initialize instance variables, substituting defaults for each value
        this.signingSecret = signingSecret;
        this.logger = logger !== null && logger !== void 0 ? logger : (() => {
            const defaultLogger = new logger_1.ConsoleLogger();
            defaultLogger.setLevel(logLevel);
            return defaultLogger;
        })();
        this.customPropertiesExtractor = customPropertiesExtractor;
    }
    init(app) {
        this.app = app;
    }
    start(..._args) {
        return new Promise((resolve, reject) => {
            try {
                const handler = this.toHandler();
                resolve(handler);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    // eslint-disable-next-line class-methods-use-this
    stop(..._args) {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }
    toHandler() {
        return async (azureRequest) => {
            var _a;
            this.logger.debug(`Azure event: ${JSON.stringify(azureRequest, null, 2)}`);
            const { body, rawBody } = azureRequest
            // ssl_check (for Slash Commands)
            if (typeof body !== 'undefined' &&
                body != null &&
                typeof body.ssl_check !== 'undefined' &&
                body.ssl_check != null) {
                return Promise.resolve({ statusCode: 200, body: '' });
            }
            // request signature verification
            const signature = this.getHeaderValue(azureRequest.headers, 'X-Slack-Signature');
            const ts = Number(this.getHeaderValue(azureRequest.headers, 'X-Slack-Request-Timestamp'));
            if (!this.isValidRequestSignature(this.signingSecret, rawBody, signature, ts)) {
                return Promise.resolve({ statusCode: 401, body: '' });
            }
            // url_verification (Events API)
            if (typeof body !== 'undefined' &&
                body != null &&
                typeof body.type !== 'undefined' &&
                body.type != null &&
                body.type === 'url_verification') {
                return Promise.resolve({
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ challenge: body.challenge }),
                });
            }
            // Setup ack timeout warning
            let isAcknowledged = false;
            setTimeout(() => {
                if (!isAcknowledged) {
                    this.logger.error('An incoming event was not acknowledged within 3 seconds. ' +
                        'Ensure that the ack() argument is called in a listener.');
                }
            }, 3001);
            // Structure the ReceiverEvent
            let storedResponse;
            const event = {
                body,
                ack: async (response) => {
                    if (isAcknowledged) {
                        throw new errors_1.ReceiverMultipleAckError();
                    }
                    isAcknowledged = true;
                    if (typeof response === 'undefined' || response == null) {
                        storedResponse = '';
                    }
                    else {
                        storedResponse = response;
                    }
                },
                retryNum: this.getHeaderValue(azureRequest.headers, 'X-Slack-Retry-Num'),
                retryReason: this.getHeaderValue(azureRequest.headers, 'X-Slack-Retry-Reason'),
                customProperties: this.customPropertiesExtractor(azureRequest),
            };
            // Send the event to the app for processing
            try {
                await ((_a = this.app) === null || _a === void 0 ? void 0 : _a.processEvent(event));
                if (storedResponse !== undefined) {
                    if (typeof storedResponse === 'string') {
                        return { statusCode: 200, body: storedResponse };
                    }
                    return {
                        statusCode: 200,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(storedResponse),
                    };
                }
            }
            catch (err) {
                this.logger.error('An unhandled error occurred while Bolt processed an event');
                this.logger.debug(`Error details: ${err}, storedResponse: ${storedResponse}`);
                return { statusCode: 500, body: 'Internal server error' };
            }
            return { statusCode: 404, body: '' };
        };
    }
    // eslint-disable-next-line class-methods-use-this
    isValidRequestSignature(signingSecret, body, signature, requestTimestamp) {
        if (!signature || !requestTimestamp) {
            return false;
        }
        // Divide current date to match Slack ts format
        // Subtract 5 minutes from current time
        const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
        if (requestTimestamp < fiveMinutesAgo) {
            return false;
        }
        const hmac = forge_1.hmac.create();
        hmac.start('sha256', signingSecret)
        const [version, hash] = signature.split('=');
        hmac.update(`${version}:${requestTimestamp}:${body}`);
        if (!tsscmp_1(hash, hmac.digest().toHex())) {
            return false;
        }
        return true;
    }
    // eslint-disable-next-line class-methods-use-this
    getHeaderValue(headers, key) {
        const caseInsensitiveKey = Object.keys(headers).find((it) => key.toLowerCase() === it.toLowerCase());
        return caseInsensitiveKey !== undefined ? headers[caseInsensitiveKey] : undefined;
    }
}

module.exports = {
    AzureReceiver: AzureReceiver
};
