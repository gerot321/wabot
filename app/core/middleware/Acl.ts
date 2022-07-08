import { ExpressMiddlewareInterface, Middleware } from '@wavecore/routing-controllers';
import { Env } from '../config/Env';
import { unauthorized } from '../service/ResponseFormat';

@Middleware({ type: 'before' })
export class Acl implements ExpressMiddlewareInterface {
	use(req: any, res: any, next: (err?: any) => any): void {
		const url = req.originalUrl;
		let aclExcludedUrl: [string];
		if (Env().aclExcludedUrl && Array.isArray(Env().aclExcludedUrl)) {
			aclExcludedUrl = Env().aclExcludedUrl;
		} else {
			aclExcludedUrl = ['/auth'];
		}

		for (const aclExcludedUrlPart of aclExcludedUrl) {
			if (url.startsWith(aclExcludedUrlPart)) return next();
		}

		if (
			!req.user ||
			!req.user.permissions ||
			!Array.isArray(req.user.permissions) ||
			req.user.permissions.length === 0
		) {
			return res.status(403).json(unauthorized('Unauthorized'));
		}

		const userPermissions = req.user.permissions;
		if (userPermissions.indexOf('ALL') > -1) {
			return next();
		}

		const urlAcls = url.toUpperCase().split('/');
		let requiredPermission = '';
		for (const urlAcl of urlAcls) {
			if (urlAcl.length > 0) {
				if (requiredPermission.length > 0) requiredPermission += '_';
				requiredPermission += urlAcl.replace(/[^a-zA-Z0-9]+/g, '_');
			}
		}

		for (const userPermission of userPermissions) {
			const userAclParts = userPermission.split('_');
			const userAclMethod = userAclParts[userAclParts.length - 1];
			const userAclName = userPermission.substr(0, userPermission.length - (userAclMethod.length + 1));
			if (requiredPermission.startsWith(userAclName) && req.method.toUpperCase() === userAclMethod) {
				return next();
			}
		}

		return res.status(403).json(unauthorized('Unauthorized'));
	}
}
