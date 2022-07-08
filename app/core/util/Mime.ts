import * as mime from 'mime-types';

export class Mime {
	static getExtension(mimeType) {
		return mime.extension(mimeType) as string;
	}
	static formatFileName(fileName, mimeType) {
		const result = '';
		return result.concat(fileName, this.formatExtension(mimeType));
	}
	static formatExtension(mimeType) {
		const result = '';
		return result.concat('.', this.getExtension(mimeType));
	}
}
