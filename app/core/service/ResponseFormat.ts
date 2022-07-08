import { status } from '../constant/response';
import {ErrorCode} from '../util/Error';
import {BaseSequelizeModel} from '../model/mysql/BaseSequelizeModel';

export function success(data: any, additional: any = {}) {
	if (Array.isArray(data)) data = data.map( (item) => {
		if (item instanceof BaseSequelizeModel) return item.toJSON();
		else return item;
	});
	if (Array.isArray(data.list)) data.list = data.list.map( (dataItem) => {
		if (dataItem instanceof BaseSequelizeModel) return dataItem.toJSON();
		else return dataItem;
	});
	if (data instanceof BaseSequelizeModel) data = data.toJSON();
	return { status: status.success, data, ...additional };
}
export function error(message: string) {
	return fail(status.error, message);
}

// tslint:disable-next-line:no-shadowed-variable
export function errorCode(errorCode: { code: string; label: string }, message? : string) {
	return fail(status.error, message ? message : errorCode.label, errorCode.code);
}
export function errorWithData(message: string, data:{}) {
	return {status: status.error, message: message ? message : "Please check data", data}
}
export function unauthorized(message?: string) {
	return errorCode(ErrorCode.UNAUTHORIZED, message);
}

// tslint:disable-next-line:no-shadowed-variable
function fail(status: string, message: string, code?: string) {
	if (!code) code = 'ERROR';
	return { status, message, code };
}
