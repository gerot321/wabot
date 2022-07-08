import * as bcrypt from 'bcrypt';

export class PasswordUtils {
	static generateHash(input: string) {
		return bcrypt.hashSync(input, 10);
	}
	static generateResetToken(length:number) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
	static passwordConfirmation(password: string, confirmPassword:string){
		if (password !== confirmPassword) return false;
		return true;
	}
	static passwordLength(password: string, amount:number){
		if (password.length < amount) return false;
		return true;
	}
}
