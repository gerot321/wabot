import {ExpressErrorMiddlewareInterface, Middleware} from '@wavecore/routing-controllers';
import {error, errorCode} from '../index';
import {ErrorCode} from '../util/Error';
import {ValidationError} from '../error/ErrorClass';

@Middleware({type: 'after'})
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
	error(err: any, request: any, response: any, next: (err: any) => any) {
		if (err.name == 'NotFoundError' && err.httpCode == 404) return;

		if (err.constructor === ValidationError) {
			return response.json(errorCode(ErrorCode.VALIDATION_ERROR, err.message));
		}
		console.log(err);
		if (err.constructor === SyntaxError) {
			return response.status(500).json(errorCode(ErrorCode.INVALID_JSON));
		}
		return response.status(500).json(errorCode(ErrorCode.SYSTEM_ERROR));
	}
}
