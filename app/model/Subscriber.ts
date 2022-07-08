import {BelongsTo, Column, ForeignKey, Table} from 'sequelize-typescript';
import { BaseSequelizeModel } from '../core';
import {Account} from './Account';

@Table
export class Subscriber extends BaseSequelizeModel {
	@Column
	client: string;

	@ForeignKey(() => Account)
	@Column
	accountId: number;

	@BelongsTo(() => Account)
	account: Account;

}
