import {Env} from '../index';

export function testEnable(key: string) {
	return key == 'enable';
}
export function isProd() {
	return Env().environment == 'production';
}
