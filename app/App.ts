import * as envData from '../config/Env.json';
import { Env, SetEnv } from './core';
SetEnv(envData);

import * as iconv from 'iconv-lite';
import {createServer} from './AppInit';
iconv.encodingExists('foo');

export class Core {
	static startServer() {
		const app = createServer();
		app.listen(Env().express.port, () => console.log(`listening on port ${Env().express.port}!`));
	}
}

Core.startServer();
