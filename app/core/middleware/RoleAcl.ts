import {ExpressMiddlewareInterface, Middleware} from '@wavecore/routing-controllers';

@Middleware({type: 'before'})
export class RoleAcl implements ExpressMiddlewareInterface {
	static roleAcl: any;

	async use(req: any, res: any, next: (err?: any) => any): Promise<void> {
		if (req.user) {
			if(req.user.id && req.user.role) {
				req.user.permissions = RoleAcl.getAclList(req.user.role);
			}
		}

		return next();
	}

	static getAclList(role){
		if (RoleAcl.roleAcl[role])
			return RoleAcl.roleAcl[role];
		else
			throw Error('Role without ACL');
	}
}
