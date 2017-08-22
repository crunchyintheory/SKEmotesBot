'use strict';

const Discord = require('discord.js');
const SKEmotes = require('./SpiralKnightsEmotes.js');

class Bot {
    /**
     * @param  {string}           discordToken         The token used to authenticate with Discord
     * @param  {Logger}           logger               The logger object
     * @param  {Object}           [options]            Bot options
     * @param  {number}           [options.shardId]    The shard ID of this instance
     * @param  {number}           [options.shardCount] The total number of shards
     * @param  {string}           [options.prefix]     Prefix for calling the bot
     * @param  {MarkdownSettings} [options.mdConfig]   The markdown settings
     */
    constructor(discordToken, logger, { shardId = 0, shardCount = 1, prefix = process.env.PREFIX, owner = null } = {}) {

        /**
         * @type {Discord.Client}
         * @private
        */
        this.client = new Discord.Client({
            fetchAllMembers: true,
            ws: {
                compress: true,
                large_threshold: 1000,
            },
            shardId,
            shardCount,
        });

        this.shardId = shardId;
        this.shardCount = shardCount;

        /**
         * @type {string}
         * @private
        */
        this.token = discordToken;

        /**
         * @type {Logger}
         * @private
        */
        this.logger = logger;

        /**
         * @type {string}
         * @private
        */
        this.escapedPrefix = prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        /**
         * @type {string}
         * @private
        */
        this.prefix = prefix;

        /**
         * @type {boolean}
        */
        this.readyToExecute = false;

        /**
         * @type {string}
        */
        this.owner = owner;

        /**
         * @type {string}
        */
        this.statusMessage = '/SK Emotes ready';

        this.setupHandlers();
    }

    setupHandlers() {
        this.client.on('ready', () => this.onReady());
        this.client.on('message', message => this.onMessage(message));

        this.client.on('disconnect', (event) => {
            this.logger.fatal(`Disconnected with close event: ${event.code}`);
            process.exit(4);
        });

        this.client.on('error', error => this.logger.error(error));
        this.client.on('warn', warning => this.logger.warning(warning));
    }

    start() {
        this.client.login(this.token)
            .then(() => {
                this.logger.info('Logged in!');
            }).catch((e) => {
                this.logger.error(e.message);
                this.logger.fatal(e);
                process.exit(1);
            });
    }

    onReady() {
        this.logger.info(`${this.client.user.username} ready!`);
        this.logger.info(`Bot: ${this.client.user.username}#${this.client.user.discriminator}`);
        this.client.user.setGame(this.statusMessage);
        this.readyToExecute = true;
    }

    /**
     * @param {Message} message
    */
    onMessage(message) {
        if (this.readyToExecute && !message.author.bot) {
            if (message.content.startsWith('/')) {
                let msg = message.content.substring('1');
                try {
                    SKEmotes.forEach(function (x) {
                        let regex = new RegExp(`^(?:${x.command})(?: (.+)|$)`, 'i');
                        let match = msg.match(regex);
                        if (!match) {
                            return false;
                        } else {
                            if (match[1] && x.partner) {
                                message.channel.send(x.partner.replace('%1', message.author.username).replace('%2', match[1]).replace('@', '@ '));
                            } else {
                                message.channel.send(x.content.replace('%1', message.author.username).replace('@', '@ '));
                            }
                            message.delete();
                        }
                    }.bind(this));
                }
                catch (e) {
                    this.logger.error(e);
                }
            }
        }
    }
}

module.exports = Bot;
