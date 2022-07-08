import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import { createSchema, typedModel } from 'ts-mongoose';
import { Env } from '..';
import {BaseMongooseModel} from '../model/mongodb/BaseMongooseModel';

export class MongoDBService {
	constructor(schemaName, schemaObject?, schemaOptions?, collectionName?) {
		if (_.isEqual(typeof schemaName, 'object')) {
			this.schemaName = schemaName.schemaName;
			this.schemaObject = schemaName.schema;
		} else {
			this.schemaName = schemaName;
			this.schemaObject = schemaObject;
		}
		this.collectionName = collectionName ? collectionName : Env().mongodb.database;
		let schemaOptionsValue = {};
		if (schemaOptions) {
			schemaOptionsValue = _.assign({}, schemaOptionsValue, schemaOptions);
		}
		this.schema = mongoose.models[this.schemaName] === undefined ?
			createSchema(this.schemaObject, schemaOptionsValue) :
			mongoose.models[this.schemaName].schema;
	}

	schema;
	schemaObject;
	schemaName;
	collectionName;

	static makeSchema(schema: object, schemaNameValue: string) {
		return {
			schemaName: schemaNameValue,
			schema: _.assign({}, BaseMongooseModel, schema)
		};
	}

	getSchema() {
		return this.schema;
	}

	insertData(data) {
		const instance = this.getNewInstance(data);
		return instance.save();
	}

	getNewInstance(data?) {
		const MongooseModel = this.getModel();
		return new MongooseModel(data);
	}

	getModel() {
		return typedModel(this.schemaName, this.getSchema());
		// eturn typedModel(this.schemaName, this.getSchema(), this.collectionName);
	}

}
