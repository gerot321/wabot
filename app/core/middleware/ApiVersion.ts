import { ExpressMiddlewareInterface, Middleware } from '@wavecore/routing-controllers';

@Middleware({ type: 'before' })
export class ApiVersion implements ExpressMiddlewareInterface {
	use(req: any, res: any, next: (err?: any) => any): void {
		const url = req.originalUrl;
		req.headers.apidevice = req.headers.apidevice ? req.headers.apidevice : req.headers.apiDevice;
		req.headers.apiversion = req.headers.apiversion ? req.headers.apiversion : req.headers.apiVersion;

		req.isIos = req.headers.apidevice === 'ios' ? true : false;
		req.isAndroid = req.headers.apidevice === 'android' ? true : false;
		req.apiVersion = !isNaN(parseInt(req.headers.apiversion, 0)) ? parseInt(req.headers.apiversion, 0) : 0;

		res.isIos = req.isIos;
		res.isAndroid = req.isAndroid;
		res.apiVersion = req.apiVersion;

		return next();
	}
}
