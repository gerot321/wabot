import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import moment = require('moment');
import * as uuid from 'node-uuid';
import {CoreRedis, Env} from '..';
import { Admin } from '../../common/model/Admin';
import { hasValue } from '../util/CommonUtil';

export class AuthService {

	static async generateSessionToken(uniqueUserSecret: string, userId: number) {
		let token = '';
		if (Env().session && !Env().session?.singleLogin) {
			token = this.createSessionToken(uniqueUserSecret);
			await this.saveSessionToRedis(token, userId);
		} else {
			const sessionToken = await this.getDataSession(2, userId);
			if (!sessionToken) {
				token = this.createSessionToken(uniqueUserSecret);
				await this.saveSessionToRedis(token, userId);
			} else {
				token = this.createSessionToken(uniqueUserSecret);

				await this.deletePreviousToken(sessionToken);
				await this.saveSessionToRedis(token, userId);
			}
		}
		return token;
	}

	static createSessionToken(uniqueUserSecret) {
		return crypto.createHash('sha256').update(uuid.v1()).update(uniqueUserSecret).update(moment().toISOString()).digest("hex")
	}

	static async deletePreviousToken(sessionToken) {
		const userId = await CoreRedis(1).get(sessionToken);

		await CoreRedis(1).del(sessionToken);
		await CoreRedis(2).del(userId);
	}

	static async saveSessionToRedis(token, userId) {
		const expiredIn1 = Env()?.session && hasValue(Env()?.session?.channel1?.expiredIn) ? Env().session.channel1.expiredIn : '5259492';
		const expiredIn2 = Env()?.session && hasValue(Env()?.session?.channel2?.expiredIn) ? Env().session.channel2.expiredIn : '5259492';

		await CoreRedis(1).set(token, userId, 'EX', expiredIn1);
		await CoreRedis(2).set(userId, token, 'EX', expiredIn2);
	}

	static async generateJWTToken(userData: any) {
		return jwt.sign(userData, Env().jwtSecret);
	}

	static async saveUserData(userId: number, userData: any) {
		await CoreRedis(1).hset(`USER_DATA_${Env().projectName}`, userId, userData);
	}

	static async saveUserPermissions(userId: number, userPermissions: any) {
		await CoreRedis(1).hset(`USER_PERMISSION_${Env().projectName}`, userId, userPermissions);
	}

	static async getDataSession(channelIndex, key) {
		return CoreRedis(channelIndex).get(key);
	}

	static async authenticate() {
	}
	
	static async validateLoginAttempt(email) {
		let currentAttempt = await CoreRedis().hget(`USER_ATTEMPT_${Env().projectName}`,email);
		if(currentAttempt) currentAttempt = JSON.parse(currentAttempt);

		if(currentAttempt && currentAttempt.recordAt === moment().format('YYYY-MM-DD')){
			currentAttempt.attempt += 1;
			await CoreRedis().hset(`USER_ATTEMPT_${Env().projectName}`, email, JSON.stringify(currentAttempt));
			if(currentAttempt.attempt === 5){
				await Admin.update({status:'LOCKED'}, {where:{email}});
			}
		}else{
			await CoreRedis().hset(`USER_ATTEMPT_${Env().projectName}`, email, JSON.stringify({
				attempt:1,
				recordAt: moment().format('YYYY-MM-DD')
			}));
		}
	}

	static async clearLoginAttempt(email) {
		await CoreRedis().hdel(`USER_ATTEMPT_${Env().projectName}`, email);
	}

}
