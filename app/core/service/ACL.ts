import * as _ from 'lodash';
import { AclConstant } from '../../common/constant/AclConstant';

export function getRouteAcl( acl, role:string ) {
	const routeAcl = [];
	routeAcl.push(...AclConstant.default);
	const roleKey=_.camelCase(role);
	acl.map( aclItem =>{
		if (AclConstant[roleKey].structured[aclItem]) routeAcl.push(...AclConstant[roleKey].structured[aclItem]);
	});
	return routeAcl;
}
