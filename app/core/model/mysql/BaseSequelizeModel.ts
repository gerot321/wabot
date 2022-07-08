import Bluebird = require('bluebird');
import {DataTypes, DestroyOptions} from 'sequelize';
import { AutoIncrement, BeforeBulkDestroy, BeforeDestroy, Column, CreatedAt, Model, PrimaryKey, UpdatedAt } from 'sequelize-typescript';
import { Type } from 'ts-mongoose';
import { Env } from '../..';
import { MongoDBService } from '../../service/MongoDBService';
import * as fs from 'fs';

export class BaseSequelizeModel extends Model<any> {
	@AutoIncrement @PrimaryKey @Column public id: number;

	@CreatedAt public createdAt: Date;
	@UpdatedAt public updatedAt: Date;

	@BeforeDestroy
	@BeforeBulkDestroy
	static async logDeletedModelToMongoDB(options) {
		const tableName = this.getTableName();
		const tableNameKey = '_tableName';
		const schemaName = Env().mysql.database + '_delete';
		const schemaOption = {
			strict: false
		};


		if (options.type === 'BULKDELETE') {
			options.raw = true;
			const result = await this.findAll(options);
			result.forEach(data => BaseSequelizeModel.insertLogDeletedModel(schemaName, schemaOption, data, tableName, tableNameKey));
		} else {

			for (const attributeKey in options.rawAttributes){
				const attribute = options.rawAttributes[attributeKey];
				if ( attribute.type instanceof DataTypes.VIRTUAL){
					if (attribute.fieldName.indexOf('Filename') == -1) continue;
					const imageUrl = options[attribute.fieldName.split('Filename')[0]];
					if (imageUrl == null) continue;
					const path = imageUrl.split('/').splice(3).join('/');
					const filePath = Env().directorySettings.storagePath + '/' + path;
					try{
						if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
					} catch (e){
						console.warn(e);
					}
				}
			}

			const data = options.dataValues ? options.dataValues : await this.findOne({
				where: { id: options.id },
				raw: true
			});
			BaseSequelizeModel.insertLogDeletedModel(schemaName, schemaOption, data, tableName, tableNameKey);
		}
	}

	static insertLogDeletedModel(schemaName, schemaOption, data, tableName, tableNameKey) {
		data[tableNameKey] = tableName;
		const keys = Object.keys(data);
		const schemaObject = {};

		keys.forEach(key => {
			if (key != 'updatedAt' && key != 'createdAt') {
				schemaObject[key] = Type.optionalMixed();
			}
		});

		const mongodb = new MongoDBService(schemaName, schemaObject, schemaOption);
		mongodb.insertData(data);
	}
}
