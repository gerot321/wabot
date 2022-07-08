import {Column, HasMany, Table} from 'sequelize-typescript';
import { BaseSequelizeModel } from '../core';
import {Subscriber} from './Subscriber';

@Table
export class Account extends BaseSequelizeModel {
	@Column
	sessionName: string;

	@Column
	phone: number;

	@HasMany(() => Subscriber)
	subscribers: Subscriber[];

}
