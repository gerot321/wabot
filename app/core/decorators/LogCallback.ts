import { getMetadataArgsStorage } from '@wavecore/routing-controllers';
import { MongoDBService } from '../index';
import { Type } from 'ts-mongoose';

export function LogCallback(vendorName?, url?) {
	return (klass: any, methodName: string, desc: any) => {
		const origMethod = desc.value;
		getMetadataArgsStorage().params.push({
			type: "request",
			object: klass,
			method: methodName,
			index: -1,
			parse: false,
			required: false
		});
		desc.value = async (...args: any[]) => {
			// console.log(args);
			let headers=null;
			let body=null;
			for (let i=0;i<args.length;i++) {
				if(args[i].body && args[i].headers){
					headers=args[i].headers;
					body=args[i].body;
					args.splice(i,1);
					break;
				}
			}
			const startTime=new Date();

			let resp;
			let error : Error;
			try {
				resp = await origMethod.apply(this, args);
			} catch(catchedError){
				error = catchedError;
			}
			const endTime=new Date();
			const mongoDb=new MongoDBService(`callback_${vendorName}_${methodName}`,{
				url:Type.optionalMixed(),
				header:Type.optionalMixed(),
				method:Type.optionalMixed(),
				request:Type.optionalMixed(),
				response:Type.optionalMixed(),
				requestTime:Type.date(),
				responseTime:Type.date()
			});
			mongoDb.insertData({
				url:(url)?url:methodName,
				request:body,
				method:"get",
				header:headers,
				requestTime:startTime,
				response:resp,
				responseTime:endTime
			});
			if (error) throw error;
			return resp;
		};
		return desc;
	}
}
