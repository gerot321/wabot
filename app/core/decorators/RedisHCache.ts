import {RedisOption} from '../class/RedisOption';
import {RedisService} from '../service/RedisService';

export function RedisHCache(redisOption: RedisOption) {
	return (klass: any, methodName: string, desc: any) => {
		const origMethod = desc.value;
		desc.value = async function(...args: any[]) {
			redisOption.hashKey = args.join('_');
			const cacheValue = await RedisService.hGet(redisOption);
			if (cacheValue) return cacheValue;

			const resp = await origMethod.apply(this, args);
			if (resp) {
				redisOption.data = resp;
				RedisService.hSet(redisOption);
			}
			return resp;
		};
		return desc;
	};
}
