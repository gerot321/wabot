import * as Redis from 'ioredis';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Env } from './Env';
import {deprecate} from 'util';

let sequelize;
const redisClientByChannel = {};

export class Database {
	static init() {
		Database.InitSequelize();
		Database.InitMongoose();
		Database.InitRedis();
	}

	static InitSequelize() {
		const modelsRawPath = Env().sequelize.models;
		const modelsPath = [];
		modelsRawPath.forEach(modelPath => {
			modelsPath.push(path.resolve('dist/' + modelPath));
		});
		const sqlConfig = Env().mysql ? Env().mysql : Env().sql;
		if (!sqlConfig || !sqlConfig.host) {
			console.warn('No MySQL Configured')
			return;
		}
		const options: SequelizeOptions = {
			database: sqlConfig.database,
			define: {
				freezeTableName: true
			},
			dialect: sqlConfig.dialect ? sqlConfig.dialect : 'mysql',
			host: sqlConfig.host ? sqlConfig.host : '127.0.0.1',
			port: sqlConfig.port ? sqlConfig.port : '3306',
			username: sqlConfig.user,
			password: sqlConfig.password,
			models: modelsPath.length > 0 ? modelsPath : [path.resolve('dist/app/model')],
			timezone: sqlConfig.timezone ? sqlConfig.timezone : '+07:00',
			logging: sqlConfig.logging ? sqlConfig.logging : false
		};

		if (sqlConfig.options) {
			options.dialectOptions = sqlConfig.options.dialectOptions ? sqlConfig.options.dialectOptions : null;
			options.dialectOptions['decimalNumbers'] = options.dialectOptions['decimalNumbers'] ? options.dialectOptions['decimalNumbers'] : true;

			options.pool = sqlConfig.options.pool ? sqlConfig.options.pool : null;
		}

		sequelize = new Sequelize(options);
	}

	static async InitMongoose() {
		if (!Env().mongodb || !Env().mongodb.host) {
			console.warn('No MongoDB Configured')
			return;
		}
		const options = Env().mongodb.options;
		options.useUnifiedTopology = true;
		let connString = 'mongodb://' + Env().mongodb.user + ':' + Env().mongodb.password + '@' + Env().mongodb.host + ':' + Env().mongodb.port + '/' + Env().mongodb.database;
		if (!Env().mongodb.user || !Env().mongodb.password) {
			connString = 'mongodb://' + Env().mongodb.host + ':' + Env().mongodb.port + '/' + Env().mongodb.database;
		}
		await mongoose.connect(connString, options);
		const timestamps = require('mongoose-timestamp');
		mongoose.plugin(timestamps);
	}

	static InitRedis(channelIndex = 0) {
		if (!Env().redis || !Env().redis.host) {
			console.warn('No Redis Configured')
			return;
		}
		if (!Env().redis) return;
		const redisOption = {
			port: Env().redis.port,
			host: Env().redis.host,
			db: channelIndex
		};
		if (Env().redis.password) redisOption['password'] = Env().redis.password;

		redisClientByChannel[channelIndex] = new Redis(redisOption);
	}

}

export const CoreSequelize = () => {
	return sequelize;
};

export const CoreRedis = (channelIndex = 0) => {
	let redisClient = redisClientByChannel[channelIndex];
	if (!redisClient){
		Database.InitRedis(channelIndex);
		redisClient = redisClientByChannel[channelIndex];
	}
	return redisClient;
};

/**
 * @deprecate Instead use CoreRedis with channelIndex
 */

export const CoreRedisSession = (channelIndex = 1) => {
	return CoreRedis(channelIndex);
};

