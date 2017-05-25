'use strict';

const cluster = require('cluster');

/**
@type {Bot}
*/

const Bot = require('./src/Bot.js');

/**
@type {Object}
*/
const Logger = require('./src/Logger.js');

const logger = new Logger();

/**
@type {Function}
*/
const ClusterManager = require('./src/ClusterManager.js');

if (cluster.isMaster) {
    const localShards = process.env.LOCAL_SHARDS;
    const shardOffset = process.env.SHARD_OFFSET;

    const clusterManager = new ClusterManager(cluster, logger, localShards, shardOffset);
    clusterManager.start();
} else {
    const totalShards = parseInt(process.env.SHARDS);
    const shard = new Bot(process.env.TOKEN, logger, {
        shardId: parseInt(process.env.shard_id, 10),
        shardCount: totalShards,
        prefix: process.env.PREFIX,
        logger,
        owner: process.env.OWNER,
    });
    shard.start();
}