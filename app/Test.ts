import {Config, Env, SetEnv, System} from './core';
import * as envData from '../config/Env.json';
SetEnv(envData);

import * as iconv from 'iconv-lite';
import {createServer} from './AppInit';
import {WaBaileysService} from './service/WaBaileysService';
import {RedisService} from './core/service/RedisService';
iconv.encodingExists('foo');

export class Core {
	static async test() {
		SetEnv(envData);
		Config.init();
		// VenomBotService.getGroupList('main');
		RedisService.publish({
			key: 'test',
			data: {'name':'Richard'}
		})

	}
}

Core.test();
