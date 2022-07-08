import {Column, HasMany, Table} from 'sequelize-typescript';
import {BaseModel} from './BaseModel';

@Table
export class Admin extends BaseModel {
	@Column email: string;
	@Column password: string;
	@Column name: string;
}
