
export class AuthUtil{
	static async ExtractBasicAuth(req){
		if (!req.headers.authorization) return {};
		const base64Credentials = req.headers.authorization.split(' ')[1];
		const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
		const [key, value] = credentials.split(':');
		return {key, value};
	}
}
