import { getMetadataArgsStorage } from '@wavecore/routing-controllers';
import { Env } from '..';

export function GetTest(route) {
	return (object, methodName: string) => {
		if (Env().testControllerEnabled === true) {
			getMetadataArgsStorage().actions.push({
				type: 'get',
				target: object.constructor,
				method: methodName,
				route
			});
		}
	};
}

export function PostTest(route) {
	return (object, methodName: string) => {
		if (Env().testControllerEnabled === true) {
			getMetadataArgsStorage().actions.push({
				type: 'post',
				target: object.constructor,
				method: methodName,
				route
			});
		}
	};
}

export function PutTest(route) {
	return (object, methodName: string) => {
		if (Env().testControllerEnabled === true) {
			getMetadataArgsStorage().actions.push({
				type: 'put',
				target: object.constructor,
				method: methodName,
				route
			});
		}
	};
}

export function PatchTest(route) {
	return (object, methodName: string) => {
		if (Env().testControllerEnabled === true) {
			getMetadataArgsStorage().actions.push({
				type: 'patch',
				target: object.constructor,
				method: methodName,
				route
			});
		}
	};
}

export function DeleteTest(route) {
	return (object, methodName: string) => {
		if (Env().testControllerEnabled === true) {
			getMetadataArgsStorage().actions.push({
				type: 'delete',
				target: object.constructor,
				method: methodName,
				route
			});
		}
	};
}
