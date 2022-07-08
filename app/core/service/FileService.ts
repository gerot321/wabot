import {Env} from '../index';
import fs = require('fs');
import {now} from 'moment';
import uniqueFilename = require('unique-filename');
import * as envData from '../../../config/Env.json';
import {ValidatorService} from './ValidatorService';
import {hasValue} from '../util/CommonUtil';

export class FileService {
	static store(fileBuffer, extension, filename?) {
		const fileName = (filename ? filename : this.getUniqueFileName()) + '.' + extension;
		const destination = envData.directorySettings.temp + '/' + fileName;
		try {
			const folders = destination.split('/');
			folders.pop();
			if (!fs.existsSync(folders.join('/'))) {
				fs.mkdirSync(folders.join('/'), {recursive: true});
			}

			fs.writeFileSync(destination, fileBuffer);
		} catch (err) {
			console.error(err);
		}
		return fileName;
	}

	static move(fileName, destinationPath) {
		if (!fileName || fileName.length < 1) return false;

		const source = envData.directorySettings.temp + '/' + fileName;
		const storagePath = envData.directorySettings.storagePath + '/' + destinationPath;
		const fullStoragePath = storagePath + '/' + fileName;

		if (!fs.existsSync(source)) return false;
		if (!fs.existsSync(storagePath)) {
			fs.mkdirSync(storagePath, {recursive: true});
		}

		fs.copyFile(source, fullStoragePath, err => {
			if (err) {
				console.error(err);
			}
			this.delete(source);
		});
		return true;
	}

	static delete(filePath) {
		if (this.isExist(filePath)) {
			fs.unlink(filePath, err => {
				if (err) {
					console.error(err);
				}
			});
		}
	}

	static isExist(filePath) {
		return fs.existsSync(filePath);
	}

	static getUniqueFileName() {
		return uniqueFilename('', now());
	}

	static getFileUrl(fileName: string, destinationPath?: string) {
		if (fileName) {
			if (fileName.indexOf('https://') > -1 || fileName.indexOf('http://') > -1) {
				return fileName;
			}
		}
		if (!destinationPath) {
			return Env().storageUrl + '/' + fileName;
		}
		return Env().storageUrl + '/' + destinationPath  + '/' + fileName;
	}

	static formatJSONOutput(fileName: string, destinationPath?: string) {
		if (!fileName) {
			return null;
		}
		if (!ValidatorService.hasValue(fileName)) {
			return null;
		}
		const fullLink = this.getFileUrl(fileName, destinationPath);
		return {
			file: fileName,
			filePath: fullLink
		};
	}

	static async moveAndCreatePortofolio(platformId, portofolioResult) {

	}

	static uploadSingleImage(fileName: string, folder: string, currentImage: string) {
		if (!hasValue(fileName)) {
			return
		}
		let status = 'UPLOAD'
		if (currentImage && currentImage !== null) {
			if (fileName === null) {
				this.delete(envData.directorySettings.storagePath + '/' + folder + '/' + currentImage);
				status = 'DELETE'
			} else if (currentImage.includes(fileName)) {
				status = 'USECURRENT'
			} else if (!currentImage.includes(fileName)) {
				this.delete(envData.directorySettings.storagePath + '/' + folder + '/' + currentImage);
				status = 'UPLOAD'
			}
		} else if (currentImage === null && fileName === null) {
			status = 'NOUPLOAD'
		}

		if (status === 'UPLOAD') {
			return this.move(fileName, folder);
		} else if (status === 'DELETE') {
			return null
		} else if (status === 'USECURRENT') {
			return currentImage
		} else if (status === 'NOUPLOAD') {
			return null
		}
	}
}
