import * as path from 'path';
import { Env } from '../../index';
import { StorageService } from './StorageService';

export class ImageStorageService extends StorageService {
	constructor(subFolderName?) {
		super({
			path: path.join(Env().directorySettings.frontendDirectory, 'assets', 'upload', subFolderName ? subFolderName : ''),
			exclusive: true
		});
	}
}
