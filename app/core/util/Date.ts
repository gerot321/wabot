import * as moment from 'moment';
import Base = moment.unitOfTime.Base;
import { unitOfTime } from 'moment';

export class Date {
	static customDay=null;
	static getTime(customTime?){
		if(customTime){
			return moment(customTime).utcOffset("+0700");
		}
		if(this.customDay){
			const customMoment=moment().set("date",this.customDay).utcOffset("+0700");
			return customMoment
		}
		return moment().utcOffset("+0700");
	}

	static getStartOfToday(customTime?){
		return this.getTime(customTime).startOf("day");
	}

	static getDate(customTime?){
		return this.getTime(customTime).format("YYYY-MM-DD");
	}

	static formatDateAndTime(date, format: string = 'DD/MM/YYYY HH:mm') {
		return moment(date).format(format);
	}

	static getRemainingTime(date: Date, durationHour: number, unit: Base = 'hours' ): number {
		const deadline = moment(date).add(durationHour, 'hour');
		const duration = moment.duration(deadline.diff(new Date()));
		return duration.as(unit);
	}

	static getDeadline(date: Date, durationHour: number): Date {
		return moment(date).add(durationHour, 'hour').toDate();
	}
}
