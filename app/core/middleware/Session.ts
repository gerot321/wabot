import { ExpressMiddlewareInterface, Middleware } from '@wavecore/routing-controllers';
import {CoreRedis, Env, unauthorized} from '..';
import { CoreRedisSession } from '../config/Database';
import { AuthService } from '../service/AuthService';

@Middleware({ type: 'before' })
export class Session implements ExpressMiddlewareInterface {
	async use(req: any, res: any, next: (err?: any) => any) {
		const url = req.originalUrl;
		let jwtExcludedUrl: [string];
		if (Env().jwtExcludedUrl && Array.isArray(Env().jwtExcludedUrl)) {
			jwtExcludedUrl = Env().jwtExcludedUrl;
		} else {
			jwtExcludedUrl = ['/auth'];
		}

		for (const i in jwtExcludedUrl) {
			if (url.startsWith(jwtExcludedUrl[i])) return next();
		}

		const token = this.getBearerToken(req);
		if (!token) return res.status(403).json(unauthorized('Token required'));
		try {
			const userId = await AuthService.getDataSession(1, token);
			if (Env().session?.singleLogin) {
				const validToken = await AuthService.getDataSession(2, userId);
				if (validToken != token){
					CoreRedis(1).del(token);
					return res.status(403).json(unauthorized('Invalid token'));
				}
			}
			const userData = await CoreRedis(1).hget(`USER_DATA_${Env().projectName}`, userId);

			if (userData) {
				req.user = JSON.parse(userData);
				return next();
			} else {
				return res.status(403).json(unauthorized('Invalid token'));
			}
		} catch (err) {
			return res.status(403).json(unauthorized(err));
		}
	}

	getBearerToken(req) {
		if (req.headers.authorization) {
			const bearers = req.headers.authorization.split(' ');
			if (bearers.length === 2 && bearers[0] === 'Bearer') {
				return bearers[1];
			}
		}
		if (req.query.authToken) return req.query.authToken;
		return;
	}
}
