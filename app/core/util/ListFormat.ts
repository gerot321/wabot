import * as moment from 'moment';
import { FindOptions, Op } from 'sequelize';
import { RequestList } from '../model/list/RequestList';
import { ResponseList } from '../model/list/ResponseList';

export function generateDefaultOption(input: RequestList, dateRangeFilter: object, searchField = [], nestedOrder = {}, formatFilterDate?): FindOptions {
	const option = {};

	const condition = generateFilter(input.filter, dateRangeFilter, searchField, formatFilterDate);
	if (condition) {
		option['where'] = condition;
	} else option['where'] = {};

	option['limit'] = generateLimit(input).limit;
	option['offset'] = generateLimit(input).offset;
	option['order'] = generateOrder(input,nestedOrder);

	return option;
}

export function generateFilter(filter, dateRangeFilter: object, searchField = [], formatFilterDate?) {
	const condition = {};
	if (!filter) {
		return;
	}
	Object.keys(filter).forEach(function eachKey(key) {
		if (filter[key]) {
			if (dateRangeFilter.hasOwnProperty(key)) {
				let filterDate = moment(filter[key]).local();
				if (filterDate.isValid()) {
					if (!condition[dateRangeFilter[key]]) condition[dateRangeFilter[key]] = {};
					if (key.indexOf('From') !== -1) {
						filterDate = moment(filterDate)
							.startOf('day');
						Object.assign(condition[dateRangeFilter[key]], { [Op.gte]: filterDate.format(!formatFilterDate ? 'YYYY-MM-DD HH:mm:ss' : formatFilterDate) });
					}
					if (key.indexOf('To') !== -1) {
						filterDate = moment(filterDate)
							.endOf('day');
						Object.assign(condition[dateRangeFilter[key]], { [Op.lte]: filterDate.format(!formatFilterDate ? 'YYYY-MM-DD HH:mm:ss' : formatFilterDate) });
					}
				}
			} else {
				if (key === 'search') {
					condition[Op.or] = [];
					searchField.map(like => {
						const orLike = {};
						const escapeFilterValue = filter[key].replace(/(_|%|\\)/g, '\\$1');

						orLike[like] = { [Op.like]: '%' + escapeFilterValue + '%' };
						condition[Op.or].push(orLike);
					});
				} else {
					condition[key] = filter[key];
				}
			}
		}
	});
	return condition;
}

export function generateLimit(input) {
	const option = {
		limit: 20,
		offset: 0
	};

	if (input.dataPerPage) {
		option.limit = input.dataPerPage;
	}
	if (input.pageCurrent) {
		option.offset = option.limit * (input.pageCurrent - 1);
	}

	return option;
}

export function generateOrder(input, nestedOrder) {
	const defaultOrderBy = ['id', 'DESC'];
	let orderBy = [defaultOrderBy];

	if (input.orderBy) {
		orderBy = [];
		Object.keys(input.orderBy).forEach(function eachKey(key) {
			if (input.orderBy[key]) {
				orderBy.push([key, input.orderBy[key]]);
			}
		});
		if (orderBy.length > 0) {
			if(nestedOrder[orderBy[0][0]]){
				orderBy = [ [ ...nestedOrder[orderBy[0][0]], orderBy[0][1] ] ];
			}
		}
	}
	return orderBy;
}

export function generateDefaultMapping(data) {
	const results = [];

	data.map(result => {
		const newResult = {};
		Object.keys(result.dataValues).forEach(function eachKey(key) {
			newResult[key] = result.dataValues[key];
		});
		results.push(newResult);
	});

	return results;
}

export function generateDefaultMappingRow(data) {
	const result = {};

	Object.keys(data.dataValues).forEach(function eachKey(key) {
		if (typeof data.dataValues[key] !== 'object') {
			result[key] = data.dataValues[key] ? data.dataValues[key] : null;
		} else if (data.dataValues[key] === null) {
			result[key] = null;
		}
	});

	return result;
}

export async function generateResponseList(requestList: RequestList, option: FindOptions, data: any[], total = 0, defaultMapping = false): Promise<ResponseList> {
	let results;

	if (defaultMapping) {
		results = generateDefaultMapping(data);
	}

	const responseList = {
		list: defaultMapping ? results : data,
		dataPerPage: option.limit,
		pageCurrent: requestList.pageCurrent ? requestList.pageCurrent : 1,
		pageTotal: requestList.pageCurrent ? (Math.ceil(total / option.limit) <= 1 ? 1 : Math.ceil(total / option.limit)) : 1,
		countTotal: total
	};

	return responseList;
}

export function manualGenerateFilter(input, model, allowedFilter = [], searchField = [], deletedAt = true) {
	const filterArray = [];
	if(deletedAt) filterArray.push(model + `.deletedAt IS NULL`);
	Object.keys(input.filter).forEach(function eachKey(key) {
		if (input.filter[key]) {
			allowedFilter.map(allow => {
				if (key === allow) {
					if (key === 'search') {
						const likeArray = [];
						searchField.map(like => {
							likeArray.push(model + `.` + like + ` like '%` + input.filter[key] + `%'`);
						});
						filterArray.push(` ( ` + likeArray.join(' OR ') + ` ) `);
					} else {
						filterArray.push(model + `.` + allow + ` = '` + input.filter[key] + `'`);
					}
				}
			});
		}
	});

	return filterArray;
}

export function manualGenerateOrder(input, model, allowedOrder = []) {
	let orderCondition = '';
	Object.keys(input.orderBy).forEach(function eachKey(key) {
		allowedOrder.map(allow => {
			if (input.orderBy.hasOwnProperty(allow)) {
				orderCondition = model + `.` + allow + ` ` + input.orderBy[allow];
			}
		});
	});

	return orderCondition;
}

export function generateNestedIncludeOrder(input) {
	const defaultOrderBy = ['id', 'DESC'];
	let orderBy = [defaultOrderBy];

	if (input.orderBy) {
		orderBy = [];
		Object.keys(input.orderBy).forEach(function eachKey(key) {
			if (input.orderBy[key]) {
				orderBy.push([key, input.orderBy[key]]);
			}
		});
	}
	return orderBy;
}
