import * as path from 'path';
import { Env } from '../..';
import { FileUtil } from '../../util/FileUtil';
import { StorageService } from './StorageService';

export class TempStorageService extends StorageService {
	permanentStorage: StorageService;

	constructor(permanentStorage: StorageService) {
		super({
			path: path.join(Env().directorySettings.frontendDirectory, 'assets', 'upload', 'temp'),
			exclusive: true
		});
		this.permanentStorage = permanentStorage;
	}

	async store(file: Buffer, mimeType: string): Promise<string> {
		const fileName = FileUtil.getUniqueFileName();
		return super.store(file, fileName, mimeType);
	}

	async moveToPermanentStorage(fileName: string, mimeType: string) {
		const buffer = await this.getBuffer(fileName, mimeType);
		await this.permanentStorage.store(buffer, fileName, mimeType);
		await this.delete(fileName, mimeType);
	}
}
