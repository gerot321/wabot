import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';
import { addAttribute, getAttributes } from 'sequelize-typescript';

/**
 * @deprecated instead use 1 decorator, ColumnImage
 */
export function ColumnAlias(of): any {
	return (target: any, propertyName: string): void => {
		const columns = getAttributes(target);
		if (!Object.keys(columns).includes(of)) throw new Error(`Cannot find alias of '${of}' on '${propertyName}'`);

		const options: ModelAttributeColumnOptions = {
			type: DataTypes.VIRTUAL,
			get(): any {
				return this.getDataValue(of)
			},
		};

		addAttribute(target, propertyName, options);
	};
}
