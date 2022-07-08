import { useExpressServer } from '@wavecore/routing-controllers';
import * as express from 'express';
import * as path from 'path';
import 'reflect-metadata';
import { Config } from './config';
import { Env, SetEnv } from './config/Env';
import { ApiVersion } from './middleware/ApiVersion';
import * as CommonServiceCore from './service/CommonService';

import * as cookieParser from 'cookie-parser';

export class Core {
	static init(envData) {
		SetEnv(envData);
		Config.init();

		const app = express();
		app.use(cookieParser());
		// app.use(csrf({ cookie: true }));
		useExpressServer(app, {
			cors: true,
			routePrefix: '/api',
			middlewares: [ApiVersion],
			// middlewares: [Jwt, Csrf, CsrfErrorHandler, ApiVersion],
			controllers: [path.join(__dirname, 'controllers', '*.js')]
		});
		app.listen(Env().express.port, () => console.log(`Example app listening on port ${Env().express.port}!`));
	}
}

export * from './config/Env';
export { Database, CoreSequelize, CoreRedis } from './config/Database';
export { Config } from './config/index';

export * from './middleware/Acl';
export * from './middleware/ApiVersion';
export * from './middleware/Jwt';
export * from './middleware/ErrorHandler';

export * from './model/mysql/BaseSequelizeModel';
export * from './model/list/RequestList';
export * from './model/list/ResponseList';

export const CommonService = CommonServiceCore;
export * from './service/ResponseFormat';
export * from './service/StorageService/ImageStorageService';
export * from './service/StorageService/StorageService';
export * from './service/StorageService/TempStorageService';
export * from './service/MongoDBService';

export * from './util/MongoDBUtility';
export * from './util/ListFormat';
export * from './util/Mime';
export * from './util/System';
