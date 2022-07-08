import * as envData from '../../../config/Env.json';
import * as moment from 'moment';
import {ValidationError} from '../error/ErrorClass';

export function validate( field , required = []) {
	const condition = {};
	const result = { status : true, message : 'valid payload'}

	if(!field) {result.status = false; result.message = 'field not found'};
	Object.keys(field)
		.forEach(function eachKey(key) {
			if(result.status){
				if(required.indexOf(key) !== -1){
					if(!field[key] && field[key] !== 0){
						result.status = false;
						result.message = key + ' is required';
					}
				}
			}
		});
	return result;
}

export function validateInput(input, validation, errorMessage?) {
	for(const key in validation) {
		if(typeof getInputValue(input, key) === 'undefined' || getInputValue(input, key) === '') {
			const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' is required';
			throw new ValidationError(errorMessageString);
		} else if(validation[key] instanceof Array) {
			const type = validation[key][0];
			if(input[key] instanceof Array !== true) {
				const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' must be array of ' + type + ' only';
				throw new ValidationError(errorMessageString);
			}
			if(!input[key].every((value) => { return typeof value === type })) {
				const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' must be array of ' + type + ' only';
				throw new ValidationError(errorMessageString);
			}
		} else if(typeof input[key] !== validation[key] && (validation[key] === 'date' && moment(input[key]).isValid() === false)) {
			const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' must be ' + validation[key];
			throw new ValidationError(errorMessageString);
		}
	}
	return;
}

export function initialValidateNested( input, validation, errorMessage?) {
	const result = { status : true, message : 'valid payload', data : []}

	for(const key in validation) {
		const keyInvalid = {}
		if(typeof getInputValue(input, key) === 'undefined' || getInputValue(input, key) === '') {
			const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' is required';
			keyInvalid[key] = errorMessageString;
		} else if(validation[key] instanceof Array) {
			const type = validation[key][0];
			if(input[key] instanceof Array !== true) {
				const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' must be array of ' + type + ' only';
				keyInvalid[key] = errorMessageString;
			}
			if(!input[key].every((value) => { return typeof value === type })) {
				const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' must be array of ' + type + ' only';
				keyInvalid[key] = errorMessageString;
			}
		} else if(typeof input[key] !== validation[key] && (validation[key] === 'date' && moment(input[key]).isValid() === false)) {
			const errorMessageString = errorMessage && errorMessage[key] ? errorMessage[key] : key + ' must be ' + validation[key];
			keyInvalid[key] = errorMessageString;
		}
		if(Object.keys(keyInvalid).length > 0) result.data.push(keyInvalid);
	}
	return result;
}

export function setValidationNestedAttribute( key, errorMessage, result = []) {
	const index = result.findIndex(item => item.hasOwnProperty(key));
	if(index !== -1){
		result[index][key] = errorMessage;
	}else{
		const keyInvalid = {}
		keyInvalid[key] = errorMessage;
		result.push(keyInvalid)
	}
	return result;
}

export function isValidNested( result ) {
	if(result.data.length > 0){
		result.status = false;
		result.message = 'invalid payload!';
		result.data.map((item,index)=>{
			Object.keys(item).forEach(key =>{
				result.data[index] = {
					field: key,
					message: item[key]
				}
			});
		})
	}
	return result;
}

export function getInputValue(input, stringPath){
	const paths = stringPath.split('.');
	let value = input;
	for(const path of paths){
		if(typeof value[path] !== 'undefined' && value[path] !== ''){
			value = value[path];
		} else {
			value = undefined;
			break;
		}
	}
	return value;
}
export function checkAllowedFilter( input , allowedFilter = []) {
	let status = true;
	if(!input || !input.filter) status = false;
	if (input.filter) {
		Object.keys(input.filter).forEach(function eachKey(key) {
			if(status){
				if(allowedFilter.indexOf(key) === -1) status = false;
			}
		});
	}
	return status;
}

export function checkAllowedOrder( input , allowedOrder = []) {
	let status = true;
	if (input && input.orderBy) {
		Object.keys(input.orderBy).forEach(function eachKey(key) {
			if(status){
				if(allowedOrder.indexOf(key) === -1) status = false;
			}
		});
	}
	return status;
}

export function checkPayload( input , allowedFilter = [], allowedOrder = []) {

	if(!checkAllowedFilter(input, allowedFilter)){
		throw new ValidationError('Invalid filter payload, allowed filter is ('+ allowedFilter.join(', ') +')') ;
	}
	if(!checkAllowedOrder(input, allowedOrder)){
		throw new ValidationError('Invalid order payload, allowed order is ('+ allowedOrder.join(', ') +')');
	}
	const response = { status : true, message : "invalid payload" };
	return response
}

export function validEmail(email) {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}
export function validPhone(phone) {
	if (phone.substring(0, 1) == '0') phone = phone.substring(1, phone.length);
	if (phone.substring(0, 1) == '+') phone = phone.substring(1, phone.length);
	if (phone.substring(0, 2) == '62') phone = phone.substring(2, phone.length);
	const re = /^8[1235789][0-9]{6,10}$/;
	return re.test(String(phone).toLowerCase());
}
export function validExtension(extension){
	if(!extension) return false;
	const ext = extension.ext;
	if( (ext !== 'jpg' ) && (ext !== 'png')
		&& (ext !== 'jpeg') && (ext !== 'doc')
		&& (ext !== 'docx') && (ext !== 'pdf')
		&& (ext !== 'ppt') && (ext !== 'pptx')
		&& (ext !== 'xls') && (ext !== 'xlsx') ) return false;
	return true;
}

export function isProd(){
	return envData.environment === 'staging' ? false : true;
}

export function isDifferent(firstObj, secondObj) {
	return JSON.stringify(firstObj) !== JSON.stringify(secondObj);
}
