import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';
import { addAttribute, getAttributes } from 'sequelize-typescript';
import { ManipulatorService } from '../../service/ManipulatorService';

export function ColumnAsSlug(slugCombination: string[]): any {
    return (target: any, propertyName: string): void => {
        const columns = getAttributes(target);
        for (const attribute of slugCombination) {
            if (!Object.keys(columns).includes(attribute)) throw new Error(`Cannot find slug combination of '${attribute}' on '${propertyName}'`);
        }

        const options: ModelAttributeColumnOptions = {
            type: DataTypes.VIRTUAL,
            get(): any {
                // @ts-ignore
                const values: any = slugCombination.map(attribute => this.getDataValue(attribute));
                return ManipulatorService.toSlugFormat(values);
            },
        };

        addAttribute(target, propertyName, options);
    };
}
