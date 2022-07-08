import { NodeCacheService } from './NodeCacheService';
import { CoreRedis } from '../index';
import { RedisOption } from '../class/RedisOption';
import * as moment from 'moment';

export class RedisService {
	static async parse(data) {
		if (typeof data === 'object' || Array.isArray(data)) {
			return data;
		}
		try {
			const objectValue = JSON.parse(data);
			return objectValue;
		} catch (e) {}
		return data;
	}

	static stringify(data) {
		if (typeof data === 'object' || Array.isArray(data)) {
			return JSON.stringify(data);
		}
		return data;
	}

	static async setRedisExpiryTime(key, ttl, channelIndex) {
		const hasSetKey = 'redis-redisOption.key-expiry-time-set-' + key;
		if (!NodeCacheService.get(hasSetKey)) {
			try {
				CoreRedis(channelIndex).expire(key, ttl);
			} catch (error) {
				console.error(error);
			}
			NodeCacheService.set(key, true, ttl);
		}
	}

	static appendKeyWithDate(key) {
		return key + '_' + moment().format('YYYY-MM-DD');
	}

	static async get(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		const data = await CoreRedis(redisOption.channelIndex).get(keyWithDate);
		return await this.parse(data ? data : redisOption.defaultValue);
	}

	static async set(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		if (redisOption.appendUpdatedAt) {
			redisOption.data.updatedAt = Date.now();
		}
		await CoreRedis(redisOption.channelIndex).set(keyWithDate, this.stringify(redisOption.data));
		if (redisOption.expireTime > 0) {
			this.setRedisExpiryTime(keyWithDate, redisOption.expireTime, redisOption.channelIndex);
		}
	}

	static async del(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		await CoreRedis(redisOption.channelIndex).del(keyWithDate);
	}

	static async hGet(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		const data = await CoreRedis(redisOption.channelIndex).hget(keyWithDate, redisOption.hashKey);
		return await this.parse(data ? data : redisOption.defaultValue);
	}

	static async hSet(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		if (redisOption.appendUpdatedAt) {
			redisOption.data.updatedAt = Date.now();
		}
		await CoreRedis(redisOption.channelIndex).hset(keyWithDate, redisOption.hashKey, this.stringify(redisOption.data));
		if (redisOption.expireTime > 0) {
			this.setRedisExpiryTime(keyWithDate, redisOption.expireTime, redisOption.channelIndex);
		}
	}

	static async hDel(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		await CoreRedis(redisOption.channelIndex).hdel(keyWithDate, redisOption.hashKey);
	}

	static async hIncr(redisOption: RedisOption): Promise<number> {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		if (redisOption.expireTime > 0) {
			this.setRedisExpiryTime(keyWithDate, redisOption.expireTime, redisOption.channelIndex);
		}
		return await CoreRedis(redisOption.channelIndex).hincrby(keyWithDate, redisOption.hashKey, 1);
	}

	static async hDecr(redisOption: RedisOption): Promise<number> {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		if (redisOption.expireTime > 0) {
			this.setRedisExpiryTime(keyWithDate, redisOption.expireTime, redisOption.channelIndex);
		}
		return await CoreRedis(redisOption.channelIndex).hincrby(keyWithDate, redisOption.hashKey, -1);
	}

	static async hKeys(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		const data = await CoreRedis(redisOption.channelIndex).hkeys(keyWithDate);
		return await this.parse(data ? data : redisOption.defaultValue);
	}

	static async hGetAll(redisOption: RedisOption) {
		const keyWithDate = redisOption.appendKeyWithDate ? this.appendKeyWithDate(redisOption.key) : redisOption.key;
		const data = await CoreRedis(redisOption.channelIndex).hgetall(keyWithDate);
		const list = await this.parse(data ? data : redisOption.defaultValue);
		for (const key of Object.keys(list)) {
			const value = list[key];
			list[key] = await this.parse(value ? value : redisOption.defaultValue);
		}
		return list;
	}

	static async hDelAll(redisOption: RedisOption) {
		const keys = await this.hGetAll(redisOption);
		for (const key in keys) {
			await this.del({ ...redisOption, hashKey: key });
		}
	}

	static async publish(redisOption: RedisOption) {
		const stringifyData = JSON.stringify(redisOption.data);
		await CoreRedis(redisOption.channelIndex).publish(redisOption.key, stringifyData);
	}

	static async subscribe(redisOption: RedisOption, fn: (messageFn: string) => any) {
		await CoreRedis(redisOption.channelIndex).subscribe(redisOption.key, async (err, count) => {
			if (err) {
				console.error('Failed to subscribe: %s', err.message);
			}
			await CoreRedis(redisOption.channelIndex).on('message', (channel, messageRaw) => {
				if (channel == redisOption.key) {
					try {
						messageRaw = JSON.parse(messageRaw);
					} catch (e) {}
					fn(messageRaw);
				}
			});
		});
	}

	static async onSubscribeMessage(redisOption: RedisOption, fn: (messageFn: string) => any) {
		await CoreRedis(redisOption.channelIndex).on('message', (channel, messageRaw) => {
			if (channel == redisOption.key) {
				fn(JSON.parse(messageRaw));
			}
		});
	}
}
