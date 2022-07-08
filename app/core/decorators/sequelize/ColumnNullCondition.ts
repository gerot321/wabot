import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';
import { addAttribute } from 'sequelize-typescript';

export function ColumnNullCondition(): any {
	return (target: any, propertyName: any): void => {
		const options: ModelAttributeColumnOptions = {
			type: DataTypes.STRING,
			get(): any {
				return this.getDataValue(propertyName) === null ? '' : this.getDataValue(propertyName);
			},
			set(value: any) {
				this.setDataValue(propertyName, value === '' ? null : value)
			}
		};

		addAttribute(target, propertyName, options);
	};
}