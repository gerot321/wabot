import * as _ from 'lodash';

export class ValidatorService {
	static verifyTags(tags: string) {
		const regex = /^[0-9a-zA-Z,\s]*$/g;
		return regex.test(tags);
	}

	static isAlphabetical(input: string) {
		if (!this.hasValue(input)) {
			return false;
		}
		const regex = /^[a-zA-Z\s]*$/g;
		return regex.test(input);
	}

	static isName(input: string) {
		return this.isAlphabetical(input);
	}

	static isEmailAndPassword(email:string,password:string){
		if(!this.isEmail(email)){
			return false;
		}
		return this.isPassword(password);
	}

	static isPassword(input:string){
		if(!this.hasValue(input)){
			return false;
		}
		return true;
	}

	static isEmail(input: string) {
		if (!this.hasValue(input)) {
			return false;
		}
		const regex = new RegExp(
			'(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])'
		);
		return regex.test(input);
	}

	static isPhoneNumber(phoneNumber: string) {
		if (!this.hasValue(phoneNumber)) {
			return false;
		}
		const regex = /^628[1235789][0-9]{6,11}$/;
		return regex.test(phoneNumber);
	}

	static isNumber(input) {
		if (!input) {
			return false;
		}
		if (!_.isEqual(typeof input, 'number')) {
			return false;
		}
		if (_.isNaN(input)) {
			return false;
		}
		return true;
	}

	static isPositiveNumber(input) {
		if (!this.isNumber(input)) {
			return false;
		}
		if (input <= 0) {
			return false;
		}
		return true;
	}

	static isId(input) {
		if (!this.isNumber(input)) {
			return false;
		}
		if (input <= 0) {
			return false;
		}
		return true;
	}

	static hasValue(input: string) {
		if (!input) {
			return false;
		}
		if (input.length <= 0) {
			return false;
		}
		return true;
	}

	static isAlphanumeric(input: string) {
		const regex = /^[0-9a-zA-Z]*$/g;
		return regex.test(input);
	}

	static isAlphanumericAndHasValue(input: string) {
		if (!this.isAlphanumeric(input)) {
			return false;
		}
		if (!this.hasValue(input)) {
			return false;
		}
		return true;
	}
}
