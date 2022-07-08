import NodeCache = require("node-cache");
import {Callback} from "node-cache";
import {Env} from "../index";

export class NodeCacheService {
	static inMemory = null;

	static init() {
		return (
			target: object,
			key: string | symbol,
			descriptor: PropertyDescriptor
		) => {
			const original = descriptor.value;
			descriptor.value = function (...args: any[]) {
				if (!NodeCacheService.inMemory) {
					const nodeCacheOptions = Env().nodeCache;
					if (nodeCacheOptions) {
						NodeCacheService.inMemory = new NodeCache(nodeCacheOptions);
					} else {
						NodeCacheService.inMemory = new NodeCache();
					}
				}
				return original.apply(this, args);
			};
			return descriptor;
		};
	}

	@NodeCacheService.init()
	static get<T>(key: string | number, cb?: Callback<T>) {
		return this.inMemory.get(key, cb);
	}

	@NodeCacheService.init()
	static del(
		keys: (string | number) | Array<string | number>,
		cb?: Callback<number>
	) {
		return this.inMemory.del(keys, cb);
	}

	@NodeCacheService.init()
	static async delAll() {
		const keys = await this.keys();
		for (const key of keys) {
			await this.del(key);
		}
		return Promise.resolve(true);
	}

	@NodeCacheService.init()
	static keys() {
		return this.inMemory.keys();
	}

	@NodeCacheService.init()
	static set(key, value, ttl: number = 3600) {
		return this.inMemory.set(key, value, ttl);
	}

	@NodeCacheService.init()
	static async hset(
		collectionKey: string,
		hashKey: string,
		value,
		ttl: number = 3600
	) {
		const cachedData = await this.get(collectionKey);
		if (!cachedData) {
			const hashMap = {};
			hashMap[hashKey] = value;
			await this.set(collectionKey, hashMap, ttl);
		} else {
			cachedData[hashKey] = value;
			await this.set(collectionKey, cachedData, ttl);
		}
		return Promise.resolve(true);
	}

	@NodeCacheService.init()
	static async hget(collectionKey: string, hashKey: string) {
		const cachedData = await this.get(collectionKey);
		if (cachedData) {
			return cachedData[hashKey];
		}
		return null;
	}

	@NodeCacheService.init()
	static ttl(key, ttl = 3600) {
		return this.inMemory.ttl(key, ttl);
	}

	@NodeCacheService.init()
	static getTtl(key) {
		return this.inMemory.getTtl(key);
	}
}
