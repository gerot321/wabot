import * as envData from '../config/Env.json';
import {Acl, ApiVersion, Config, CoreSequelize, Env, ErrorHandler, Jwt, SetEnv} from './core';

SetEnv(envData);
import { useExpressServer } from '@wavecore/routing-controllers';
import * as express from 'express';


import * as iconv from 'iconv-lite';
import {WaBaileysService} from './service/WaBaileysService';
iconv.encodingExists('foo');

export function createServer() {
	SetEnv(envData);
	Config.init();
	// WaBaileysService.getSocket();

	const app = express();
	app.set('x-powered-by', false);
	app.set('etag', false);
	const routingControllersOption = {
		cors: true,
		defaultErrorHandler: false,
		middlewares: [
			ErrorHandler,
			ApiVersion
		],
		controllers: [__dirname + '/controllers/*.[jt]s']
	};

	const bodyParser = require('body-parser');
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
	global.WhatsAppInstances = {};

	useExpressServer(app, routingControllersOption);

	return app;
}

