import { Database } from './Database';
import { Env } from './Env';

export class Config {
	static init() {
		process.env.TZ = Env().timezone ? Env().timezone : 'Asia/Jakarta';
		Database.init();
	}
}
