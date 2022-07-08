import { Env } from '../../index';
import {DataTypes, ModelAttributeColumnOptions} from 'sequelize';
import { addAttribute, getSequelizeTypeByDesignType } from 'sequelize-typescript';

export function ColumnImage(directory: string[] | string, defaultImage?: string): any {
	return (target: any, propertyName): void => {

		if (!Env().storageUrl || !Env().directorySettings.storagePath) throw Error('Env.storageUrl & Env.storagePath must be defined!')

		const folderName = Array.isArray(directory) ? directory.join('/') : directory;
		const options: Partial<ModelAttributeColumnOptions> = {
			type: getSequelizeTypeByDesignType(target, propertyName),
			get(): any {
				return this.getDataValue(propertyName)
					? Env().storageUrl + '/' + folderName + '/' + this.getDataValue(propertyName)
					: null
			}
		};
		const optionsFilename: Partial<ModelAttributeColumnOptions> = {
			type: DataTypes.VIRTUAL,
			get(): any {
				return this.getDataValue(propertyName);
			}
		};

		addAttribute(target, propertyName, options);
		addAttribute(target, propertyName + 'Filename', optionsFilename);
	};
}
