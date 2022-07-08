import { Env, System } from '../../core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Comparator as ComparatorLocal } from '../util/Comparator';
import { RedisService } from './RedisService';
import { Promisify } from '../decorators/Promisify';
import { RedisCoreConstant } from '../constant/RedisCoreConstant';

export class UserOtpService {

	static async CreateUserOtp(phoneNumber: string, resend = false) {
		let data = {
			otpCode: Math.random()
				.toString()
				.replace('0.', '')
				.substr(0, 4),
			updatedAt:System.getTime().toDate()
		};
		const dataFromRedis=await RedisService.hGet({
			key : RedisCoreConstant.user.otp,
			hashKey : phoneNumber,
			defaultValue : [],
			appendKeyWithDate:true,
		});
		if(resend && dataFromRedis.length > 0){
			data = dataFromRedis[dataFromRedis.length-1];
			if(data){
				data.updatedAt = System.getTime().toDate();
			}
		}
		dataFromRedis.push(data);
		RedisService.hSet({
			key : RedisCoreConstant.user.otp,
			hashKey : phoneNumber,
			data : dataFromRedis,
			expireTime: 259200,
			appendUpdatedAt:false,
			appendKeyWithDate:true,
		})
		return data;
	}

	static async CheckUserOtp(phoneNumber: string, otpCode: string) {
		if (Env().otp.bypass && otpCode === '1234') {
			return true;
		}
		const dataFromRedis=await RedisService.hGet({
			key : RedisCoreConstant.user.otp,
			hashKey : phoneNumber,
			defaultValue : [],
			appendKeyWithDate:true,
		});
		const userOtp= dataFromRedis[dataFromRedis.length-1];
		if(!userOtp) return false;
		if(userOtp && userOtp.otpCode === otpCode){
			await RedisService.hDel({
				key : RedisCoreConstant.user.otp,
				hashKey : phoneNumber,
				defaultValue : [],
				appendKeyWithDate:true,
			});
			return true;
		}else{
			return false;
		}
	}

	@Promisify()
	static async isTimeout(phoneNumber: string) {
		if (Env().otp.bypass) {
			return false;
		}
		const redisKey = RedisCoreConstant.user.otp;
		const todayKey= redisKey+"_"+System.getDate();
		const userOtpToday= await RedisService.hGet({
			key : todayKey,
			hashKey : phoneNumber,
			defaultValue : [],
		});
		if(_.isEqual(userOtpToday.length,0)){} else {
			const todayLatestData=userOtpToday[userOtpToday.length-1];
			if(ComparatorLocal.timeDiff("seconds",todayLatestData.updatedAt)< (Env().otp.timeout ? Env().otp.timeout : 120)){
				return true;
			}
		}
		return false;
	}

	@Promisify()
	static async isBanned(phoneNumber: string) {
		if (Env().otp.bypass) {
			return false;
		}
		const limit = Env().otp.maxInputBan ? Env().otp.maxInputBan : 3;
		const redisKey = RedisCoreConstant.user.otp;
		const todayKey= redisKey+"_"+System.getDate();
		const userOtpToday = await RedisService.hGet({
			key : todayKey,
			hashKey : phoneNumber,
			defaultValue : [],
		});
		const userOtp=[];
		const otpResendAllowTimes= Env().otp.maxInputBan ? Env().otp.maxInputBan : 3;;
		if(userOtpToday.length>otpResendAllowTimes){
			for(let i=userOtpToday.length-otpResendAllowTimes;i<userOtpToday.length;i++){
				userOtp.push(userOtpToday[i]);
			}
		}
		let otpCounter = 0;
		for (let i = 1; i < userOtp.length; i++) {
			const current = moment(userOtp[i].updatedAt);
			const prev = moment(userOtp[i - 1].updatedAt);
			if (Math.abs(current.diff(prev, (Env().otp.maxInputUnit ? Env().otp.maxInputUnit : 'hours'))) < (Env().otp.maxInputTime ? Env().otp.maxInputUnit : 1)) {
				otpCounter++;
			}
		}
		return _.isEqual(otpCounter, limit - 1);
	}
	static async isMaxInputRetryReach(phoneNumber:string){
		const retryAttempt = await RedisService.hGet({
			key : RedisCoreConstant.user.retryAttempt,
			hashKey : phoneNumber,
			defaultValue : [],
			appendKeyWithDate:true,
		});
		let otpCounter = 0;
		const limit = (Env().otp.maxInput ? Env().otp.maxInput : 3);
		if(retryAttempt.length<limit){
			retryAttempt.push({
				updatedAt:System.getTime().toDate()
			});
			RedisService.hSet({
				key : RedisCoreConstant.user.retryAttempt,
				hashKey : phoneNumber,
				data : retryAttempt,
				appendKeyWithDate:true,
				appendUpdatedAt:false,
				expireTime:259200,
			});
			return false;
		}
		for (let i = (retryAttempt.length-(limit-1)); i < retryAttempt.length; i++) {
			const current = moment(retryAttempt[i].updatedAt);
			const prev = moment(retryAttempt[i - 1].updatedAt);
			if (ComparatorLocal.timeDiff((Env().otp.maxInputUnit ? Env().otp.maxInputUnit : 'hours'), current, prev) < (Env().otp.maxInputTime ? Env().otp.maxInputTime : 1)) {
				otpCounter++;
			}
		}

		if(_.isEqual(otpCounter, limit - 1)) return true;

		retryAttempt.push({
			updatedAt:System.getTime().toDate()
		});
		RedisService.hSet({
			key : RedisCoreConstant.user.retryAttempt,
			hashKey : phoneNumber,
			data : retryAttempt,
			appendKeyWithDate:true,
			appendUpdatedAt:false,
			expireTime:259200,
		});

		return false;
	}

	static async resetInputRetryReach(phoneNumber:string){
		await RedisService.hDel({
			key : RedisCoreConstant.user.retryAttempt,
			hashKey : phoneNumber,
			appendKeyWithDate:true,
		});
	}
}
