import * as excel from 'exceljs';
import { Worksheet } from 'exceljs';
import * as fileType from "file-type";
import * as fs from "fs";
import * as moment from 'moment';
import * as flatten from 'safe-flat';
import * as envData from '../../../config/Env.json';
import { BaseSequelizeModel } from '../../core';
import {Constant} from '../constant/Constant';
import { FileService } from '../service/FileService';

export class ExportService {

	static async export(filename, data, headers: string[], extension, workSheetName?: string) {
		if (headers.length <= 1) return false;
		const workbook = new excel.Workbook();
		const worksheet: Worksheet = workbook.addWorksheet(workSheetName ? workSheetName : 'List');
		const result = [];

		workbook.creator = envData.projectName;
		worksheet.columns = headers.map(header => {
			return {
				header,
				width: /index|id/i.test(header) ? 8 : 20
			}
		});
		worksheet.getRow(1).font = {
			bold: true
		};

		if (!(data instanceof BaseSequelizeModel)) {
			for (const dataI of data) {
				const convertedValues = Object.values(dataI);
				result.push(convertedValues);
			}
		} else {
			const json = data.toJSON();
			flatten(json);
			const convertedValues = Object.values(json);
			result.push(convertedValues);
		}
		worksheet.addRows(result);

		const buffer = extension === Constant.EXPORT_TYPE_EXCEL ? await workbook.xlsx.writeBuffer() : await workbook.csv.writeBuffer();
		const mimeType = extension === Constant.EXPORT_TYPE_EXCEL ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';

		return {
			buffer,
			filename,
			mimeType
		}
	}

	static async getExportedFile(headers, data, mainName, folderName, type?, isDate = true, returnFilePath = false) {
		type = !type ? Constant.EXPORT_TYPE_EXCEL : type;
		const isExcel = type === Constant.EXPORT_TYPE_EXCEL;
		const date = moment().format('DD-MM-YYYY-hh-mm-ss');
		const filename = isDate ? [mainName, date].join('-') : mainName;

		const file: any = await ExportService.export(filename, data, headers, type, mainName);
		const extension = isExcel ? fileType(file.buffer) : {ext: 'csv'};

		if (!fs.existsSync(envData.directorySettings.storagePath + '/' + folderName)) {
			fs.mkdirSync(envData.directorySettings.storagePath + '/' + folderName, { recursive: true });
		}

		const filepath = envData.directorySettings.storagePath + '/' + folderName + '/' + filename + '.' + extension.ext;
		fs.writeFile(filepath, file.buffer, (err) => {
			if (err) console.log(err);
		});

		if(returnFilePath) return filepath;

		return FileService.getFileUrl(filename + '.' + extension.ext, folderName)
	}
}
