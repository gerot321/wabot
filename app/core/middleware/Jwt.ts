import { ExpressMiddlewareInterface, Middleware } from '@wavecore/routing-controllers';
import * as jwt from 'jsonwebtoken';
import { Env } from '../config/Env';
import { unauthorized } from '../service/ResponseFormat';

@Middleware({ type: 'before' })
export class Jwt implements ExpressMiddlewareInterface {
	use(req: any, res: any, next: (err?: any) => any): void {
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
			const tokenData = jwt.verify(token, Env().jwtSecret);
			if (tokenData) {
				req.user = tokenData;
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
