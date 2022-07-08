import {Column, DefaultScope} from 'sequelize-typescript';
import { BaseSequelizeModel } from '../../core';

@DefaultScope(() => ({
	attributes: { exclude: ['createdAt', 'createdBy', 'updatedAt', 'updatedBy'] }
}))
export class BaseModel extends BaseSequelizeModel {
	@Column createdBy: number;
	@Column updatedBy: number;
}
