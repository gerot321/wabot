import { now } from 'moment';
import uniqueFilename = require('unique-filename');

export class FileUtil {
	static getUniqueFileName() {
		return uniqueFilename('', now());
	}
}
