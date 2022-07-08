import {Moment} from "moment";
import * as moment from "moment";
import Diff = moment.unitOfTime.Diff;

export class Comparator{
	static isEqualEitherTo(source,...target){
		const sourceType=typeof source;
		for (const testSubject of target) {
			if(typeof testSubject !== sourceType){
				return false;
			}
			if(testSubject === source){
				return true;
			}
		}
		return false;
	}

	static timeDiff(timeUnit:Diff,timeA,timeB?:Moment){
		return moment(timeB).diff(moment(timeA),timeUnit);
	}
}
