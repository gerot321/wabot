import * as moment from 'moment';
import pkgDir from 'pkg-dir';

export class System {
	static __dirName;

	static init(dirName) {
		this.__dirName = dirName;
	}

	static getTime(customTime?){
		if(customTime){
			return moment(customTime).utcOffset("+0700");
		}
		return moment().utcOffset("+0700");
	}

	static getDate(customTime?){
		return this.getTime(customTime).format("YYYY-MM-DD");
	}

	static async getProjectPath() {
		return await pkgDir(this.__dirName);
	}

	static async sleep(ms) {
		return new Promise(resolve => {
			setTimeout(resolve, ms);
		});
	}

}
