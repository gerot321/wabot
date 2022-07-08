import { Env } from '../../index';
import { ModelAttributeColumnOptions } from 'sequelize';
import { addAttribute, getSequelizeTypeByDesignType } from 'sequelize-typescript';

/**
 * @deprecated instead use 1 decorator, ColumnImage
 */
export function ColumnImageUrl(directory: string[] | string, defaultImage?: string): any {
	return (target: any, propertyName): void => {
		const folderName = Array.isArray(directory) ? directory.join('/') : directory;
		const options: Partial<ModelAttributeColumnOptions> = {
			type: getSequelizeTypeByDesignType(target, propertyName),
			get(): any {
				return this.getDataValue(propertyName)
					? Env().storageUrl + '/' + folderName + '/' + this.getDataValue(propertyName)
					: null
			}
		};

		addAttribute(target, propertyName, options);
	};
}
