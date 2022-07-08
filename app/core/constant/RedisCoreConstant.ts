import { Env } from '../../core';

export const redisBaseKey=Env().projectName + "-" + Env().appEnv;

export const RedisCoreConstant = {
	user: {
		token: Env().projectName + "-" + Env().appEnv + "-user-token",
		isBanned: Env().projectName + "-" + Env().appEnv + "-user-is-banned",
		otp: Env().projectName + "-" + Env().appEnv + "-user-otp",
		retryAttempt: Env().projectName + "-" + Env().appEnv + "-user-retry-attempt",
	},
}