import FsBlobStorage, { FsBlobStorageOptions } from 'fs-blob-storage';
import getStream from 'get-stream';
import * as path from 'path';
import { Mime } from '../../util/Mime';

export class StorageService extends FsBlobStorage {
	constructor(options: FsBlobStorageOptions) {
		super(options);
	}

	static storage = null;

	static init(...directory: string[]) {
		this.storage = new FsBlobStorage({
			path: path.join(...directory),
			exclusive: true
		});
	}

	async store(file: Buffer, fileName: string, mimeType: string) {
		const options = {
			ext: Mime.formatExtension(mimeType)
		};
		await this.delete(fileName, mimeType);
		const writable = await this.createWriteStream(fileName, options);
		writable.write(file);
		await this.commit(fileName, options);
		return fileName;
	}

	async get(fileName, mimeType) {
		const readable = await this.createReadStream(Mime.formatFileName(fileName, mimeType));
		return readable;
	}

	async delete(fileName, mimeType) {
		try {
			return await this.remove(Mime.formatFileName(fileName, mimeType));
		} catch (e) {}
	}

	async getBuffer(fileName, mimeType) {
		return await getStream.buffer(await this.get(fileName, mimeType));
	}
}
