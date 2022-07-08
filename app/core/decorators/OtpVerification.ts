import {error, errorCode, isProd} from '../../core';
import { UserOtpService } from '../service/UserOtpService';
import { ErrorCode } from '../util/Error';
import {IncomingMessage} from 'http';

export function OtpVerification(){
	return (klass: any, methodName: string, desc: any) => {
		const origMethod = desc.value;
		desc.value = async (...args: any[]) => {
			for (const arg of args) {
				if (arg instanceof IncomingMessage) continue;

				if(arg.phoneNumber && arg.otpCode){
					const inputValidation=await UserOtpService.isMaxInputRetryReach(arg.phoneNumber);
					if(inputValidation){
						return errorCode(ErrorCode.OTP_MAX_RETRY)
					}
					if(!await UserOtpService.CheckUserOtp(arg.phoneNumber,arg.otpCode)){
						return errorCode(ErrorCode.OTP_INVALID)
					}else{
						await UserOtpService.resetInputRetryReach(arg.phoneNumber);
					}
				}else{
					return errorCode(ErrorCode.OTP_REQUIRED)
				}
			}
			return await origMethod.apply(this, args);
		};
		return desc;
	}
}
