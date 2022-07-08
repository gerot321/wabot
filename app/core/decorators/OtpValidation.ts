import {error, errorCode, isProd} from '../../core';
import { UserOtpService } from '../service/UserOtpService';
import { ErrorCode } from '../util/Error';

export function OtpValidation(){
	return (klass: any, methodName: string, desc: any) => {
		const origMethod = desc.value;
		desc.value = async (...args: any[]) => {
			for (const arg of args) {
				if(arg.phoneNumber){
					if(await UserOtpService.isTimeout(arg.phoneNumber)){
						return errorCode(ErrorCode.OTP_TIMEOUT);
					}
					if(await UserOtpService.isBanned(arg.phoneNumber)){
						return errorCode(ErrorCode.OTP_BANNED);
					}
				}
			}
			return await origMethod.apply(this, args);
		};
		return desc;
	}
}
