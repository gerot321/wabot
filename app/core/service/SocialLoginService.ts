import {AxiosService} from './AxiosService';
import {ValidationError} from '../error/ErrorClass';
import {Env} from '../config/Env';
import * as jwt from 'jsonwebtoken';
const AppleAuth = require ('apple-auth');

export class SocialLoginService {

	public static async apple(authCode: string, isWebview: boolean) {
		if (!Env().apple) throw new ValidationError('Apple Sign in is not ready yet');
		if (!authCode) throw new ValidationError('Auth code is required');

		const auth = new AppleAuth({
				client_id: isWebview ? Env().apple.SERVICE_ID : Env().apple.BUNDLE_ID,
				team_id: Env().apple.TEAM_ID,
				key_id: Env().apple.KEY_ID,
				redirect_uri: Env().apple.RedirectUri,
				scope: "name email"
			},
			`${process.cwd()}/${Env().apple.KEY_PATH}`,
			'file');


		const accessToken = await auth.accessToken(authCode);
		const idToken = jwt.decode(accessToken.id_token);
		const userID = idToken.sub;
		const userEmail = idToken.email;


		return { socialId: userID, email: userEmail };
	}

	public static async facebook(authCode?: string, accessToken?: string) {
		if (!Env().facebook) throw new ValidationError('Facebook Sign in is not ready yet');
		if (!accessToken && !authCode) throw new ValidationError('Access Token or Auth code is required');

		if (!accessToken){
			let accessTokenUrl = 'https://graph.facebook.com/oauth/access_token';
			accessTokenUrl += `?client_id=${Env().facebook.APP_ID}`;
			accessTokenUrl += `&client_secret=${Env().facebook.APP_SECRET}`;
			accessTokenUrl += `&redirect_uri=${ encodeURIComponent(Env().facebook.RedirectUri) }`;
			accessTokenUrl += `&code=${authCode}`;
			const accessTokenResult = await AxiosService.get(accessTokenUrl);

			if (!accessTokenResult || !accessTokenResult.data || accessTokenResult.data.error) {
				console.error(accessTokenResult);
				throw new ValidationError('Error during facebook sign in');
			}
			else if (!accessTokenResult.data.access_token) {
				console.error(accessTokenResult);
				throw new ValidationError('Error during facebook sign in');
			}
			accessToken = accessTokenResult.data.access_token;
		}

		let profileUrl = 'https://graph.facebook.com/me';
		profileUrl += `?fields=id,email`;
		profileUrl += `&access_token=${accessToken}`;
		const profileResult = await AxiosService.get(profileUrl);

		if (!profileResult || !profileResult.data || profileResult.data.error) {
			console.error(profileResult);
			throw new ValidationError('Error during facebook sign in');
		}
		else if (!profileResult.data.id) {
			console.error(profileResult);
			throw new ValidationError('Error during facebook sign in');
		}

		const socialId = profileResult.data.id;
		const email = profileResult.data.email;


		return { socialId, email };
	}


	public static async google(authCode?: string, accessToken?: string, googleIdToken?: string) {
		if (!Env().google) throw new ValidationError('Google Sign in is not ready yet');
		if (!accessToken && !authCode) throw new ValidationError('Access Token or Auth code is required');

		if (!accessToken){
			let accessTokenUrl = 'https://oauth2.googleapis.com/token';
			accessTokenUrl += `?client_id=${Env().google.CLIENT_ID}`;
			accessTokenUrl += `&client_secret=${Env().google.CLIENT_SECRET}`;
			accessTokenUrl += `&redirect_uri=${ encodeURIComponent(Env().google.RedirectUri) }`;
			accessTokenUrl += `&code=${authCode}`;
			accessTokenUrl += `&grant_type=authorization_code`;
			accessTokenUrl += `&access_type=offline`;
			const accessTokenResult = await AxiosService.post(accessTokenUrl);

			if (!accessTokenResult || !accessTokenResult.data || accessTokenResult.data.error) {
				console.error(accessTokenResult);
				throw new ValidationError('Error during google sign in');
			}
			else if (!accessTokenResult.data.access_token) {
				console.error(accessTokenResult);
				throw new ValidationError('Error during google sign in');
			}
			accessToken = accessTokenResult.data.access_token;
			googleIdToken = accessTokenResult.data.id_token;
		}

		let profileUrl = 'https://www.googleapis.com/oauth2/v1/userinfo';
		profileUrl += `?alt=json`;
		profileUrl += `&access_token=${accessToken}`;
		const profileResult = await AxiosService.get(profileUrl, {
			headers: {
				'Authorization': `Bearer ${googleIdToken}`
			}
		});

		if (!profileResult || !profileResult.data || profileResult.data.error) {
			console.error(profileResult);
			throw new ValidationError('Error during facebook sign in');
		}
		else if (!profileResult.data.id) {
			console.error(profileResult);
			throw new ValidationError('Error during facebook sign in');
		}

		const socialId = profileResult.data.id;
		const email = profileResult.data.email;


		return { socialId, email };
	}

}

