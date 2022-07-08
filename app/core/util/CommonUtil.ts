import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';

export function hasValue(value) {
	value = typeof value == 'string' ? value.trim() : value;
	return value !== '' && value !== undefined && value !== null;
}

export function defaultValue(value, defaultReturn?) {
	if (!value) {
		if (!defaultReturn) {
			return '';
		}
	}
	return value;
}

export function pad(n: string, width: number, z: string = '0') {
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function deepClone<T>(input): T {
	const output = JSON.stringify(input);
	return JSON.parse(output);
}

export function initObject(object = {}, key: string[], defaultValue = '') {
	key.forEach(value => {
		object[value] = defaultValue;
	});
	return object;
}

export function generatePasswordHash(input: string) {
	return bcrypt.hashSync(input, 10);
}

export function safeLength(input: any[]) {
	if (!input) {
		return 0;
	}
	return input.length;
}

export function safeNestedArrayPush(object: Object, key: string[], value: any) {
	const objectKey = deepClone<[]>(key);
	if (key.length === 1) {
		if (!object[key[0]]) {
			object[key[0]] = [];
		}
		object[key[0]].push(value);
		return object;
	}
	if (!object) {
		object = {};
	}
	if (!object[key[0]]) {
		object[key[0]] = {};
	}
	objectKey.splice(0, 1);
	safeNestedArrayPush(object[key[0]], objectKey, value);
	return object;
}

export function safeNestedObject(object = {}, key: string[], value: any) {
	const objectKey = deepClone<[]>(key);
	if (!object) {
		object = {};
	}
	if (!object[key[0]]) {
		object[key[0]] = {};
	}
	if (key.length === 1) {
		object[key[0]] = value;
		return object;
	}
	objectKey.splice(0, 1);
	safeNestedObject(object[key[0]], objectKey, value);
	return object;
}

export function aclGenerator(...input) {
	let result = {};
	input.forEach(value => {
		result = _.assign(result, value);
	});
	return result;
}

export function aclCrudGenerator(controllerName: string, allowedMethod: string[] = []) {
	const result = {};
	const availableCrudAndMethod = {
		LIST: 'POST',
		DETAILS: 'GET',
		CREATE: 'PUT',
		UPDATE: 'PATCH',
		DELETE: 'DELETE',
		RESETPASSWORD: 'POST'
	};
	if (allowedMethod.length <= 0) {
		const availableKeys = Object.keys(availableCrudAndMethod);
		for (const availableKey of availableKeys) {
			result[controllerName + '_' + availableKey] = [
				controllerName + '_' + availableKey + '_' + availableCrudAndMethod[availableKey]
			];
		}
	} else {
		for (const method of allowedMethod) {
			result[controllerName + '_' + method] = [controllerName + '_' + method + '_' + availableCrudAndMethod[method]];
		}
	}
	return result;
}

export function defaultAclCrudGenerator(controllerName: string, allowedMethod: string[] = []) {
	const result = [];
	const availableCrudAndMethod = {
		LIST: 'POST',
		DETAILS: 'GET',
		CREATE: 'PUT',
		UPDATE: 'PATCH',
		DELETE: 'DELETE',
		RESETPASSWORD: 'POST'
	};
	if (allowedMethod.length <= 0) {
		allowedMethod = Object.keys(availableCrudAndMethod);
	}
	for (const method of allowedMethod) {
		result.push(controllerName + '_' + method + '_' + availableCrudAndMethod[method]);
	}
	return result;
}

export function customAclGenerator(controllerName: string, functionMethod: string[]) {
	const result = [];

	for (let data of functionMethod) {
		result.push(controllerName + '_' + data);
	}

	return result;
}

export function manualSortDate(myArray = [], types = 'ASC', key?) {
	if (types === 'DESC') {
		return myArray.sort(function(a, b) {
			return new Date(b[key ? key : 'createdAt']).getTime() - new Date(a[key ? key : 'createdAt']).getTime();
		});
	} else {
		return myArray.sort(function(a, b) {
			return new Date(a[key ? key : 'createdAt']).getTime() - new Date(b[key ? key : 'createdAt']).getTime();
		});
	}
}

export function groupByArray(array, groupBy, keyGroup?, keyValueGroup?, returnAs?: 'array' | 'object') {
	if (returnAs === 'array') {
		return array.reduce((reducedArray, item) => {
			const key = item[groupBy];
			const element = reducedArray.find(reducedItem => reducedItem && reducedItem[keyGroup ? keyGroup : 'key'] === key);
			const elementFound: boolean = !!element;

			if (elementFound) {
				element[keyValueGroup ? keyValueGroup : 'value'].push(item);
			} else {
				reducedArray.push({
					[keyGroup ? keyGroup : 'key']: key,
					[keyValueGroup ? keyValueGroup : 'value']: [item]
				});
			}

			return reducedArray;
		}, []);
	}

	if (array.length === 0) return null;
	return array.reduce((reducedArray, item) => {
		(reducedArray[item[groupBy]] = reducedArray[item[groupBy]] || []).push(item);
		return reducedArray;
	}, {});
}

export function parseIntFinal(x) {
	return typeof x === 'string' ? x : parseInt(x, 10);
}

export function getWhatChanged(source, toCheck) {
	const shouldAdd = [];
	const shouldRemove = [];

	for (const data of source) {
		const result = toCheck.find(x => x === data);
		if (!result) shouldRemove.push(data);
	}

	for (const data of toCheck) {
		const result = source.find(x => x === data);
		if (!result) shouldAdd.push(data);
	}

	return { shouldAdd, shouldRemove };
}

export function sliceIntoChunks(arr, chunkSize) {
	const res = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		const chunk = arr.slice(i, i + chunkSize);
		res.push(chunk);
	}
	return res;
}
