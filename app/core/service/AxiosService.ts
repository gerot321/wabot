import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import { MongoDBService } from '../index';
import extractDomain = require('extract-domain');
import { Type } from 'ts-mongoose';

export class AxiosService {
	static mongoDbSchemas = {};

	static async get(url: string, axiosConfig?: AxiosRequestConfig) {
		return await this.callHttp('get', url, '', axiosConfig);
	}
	static async post(url: string, data?: any, axiosConfig?: AxiosRequestConfig) {
		return await this.callHttp('post', url, data, axiosConfig);
	}

	static async patch(url: string, data?: any, axiosConfig?: AxiosRequestConfig) {
		return await this.callHttp('patch', url, data, axiosConfig);
	}

	static async put(url: string, data?: any, axiosConfig?: AxiosRequestConfig) {
		return await this.callHttp('put', url, data, axiosConfig);
	}

	static async delete(url: string, data?: any, axiosConfig?: AxiosRequestConfig) {
		return await this.callHttp('delete', url, '', axiosConfig);
	}

	static async callHttp(method: string, url: string, data?: any, axiosConfig?: AxiosRequestConfig) {
		const startTime = new Date();
		let result: any = {};
		try {
			switch (method) {
				case 'get':
					result = await axios.get(url, axiosConfig);
					break;
				case 'post':
					result = await axios.post(url, data, axiosConfig);
					break;
				case 'patch':
					result = await axios.patch(url, data, axiosConfig);
					break;
				case 'put':
					result = await axios.put(url, data, axiosConfig);
					break;
				case 'delete':
					result = await axios.delete(url, axiosConfig);
					break;
				default:
				// code block
			}
		} catch (error) {
			result = error.response;
		}
		const endTime = new Date();
		await this.getApiLogModel(url).insertData({
			url,
			request: data,
			method,
			header: result ? result.headers : '',
			requestTime: startTime,
			response:
				result && result.data
					? result.data
					: {
							status: result.status,
							statusText: result.statusText,
							config: result.config
					  },
			responseTime: endTime
		});
		return result;
	}

	static getApiLogModel(url): MongoDBService {
		const schemaName = 'apilog_' + extractDomain(url);
		if (!this.mongoDbSchemas[schemaName]) {
			const mongoDbService = new MongoDBService(schemaName, {
				url: Type.optionalMixed(),
				header: Type.optionalMixed(),
				method: Type.optionalMixed(),
				request: Type.optionalMixed(),
				response: Type.optionalMixed(),
				requestTime: Type.date(),
				responseTime: Type.date()
			});
			this.mongoDbSchemas[schemaName] = mongoDbService;
		}
		return this.mongoDbSchemas[schemaName];
	}
}
