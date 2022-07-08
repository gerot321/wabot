
export function manualGenerateFilter( input, model, allowedFilter = [], searchField = [], multiple = [], changeOperator={} ) {
	const filterArray = [];
	filterArray.push(model + `.deletedAt IS NULL`);
	Object.keys(input.filter)
		.forEach(function eachKey(key) {
			if (input.filter[key]) {
				allowedFilter.map( allow =>{
					if(key === allow){
						if( key === 'search'){
							const likeArray = [];
							searchField.map( like =>{
								likeArray.push(
									// model + `.` +
									like + ` like '%` + input.filter[key] + `%'`);
							});
							filterArray.push(` ( `+likeArray.join(' OR ')+ ` ) `);
						}else{

							if(multiple.indexOf(key) !== -1){
								const whereIn = [];
								input.filter[key].map( arrVal =>{
										whereIn.push("'"+arrVal+"'");
								});
								if(whereIn.length >0 ){
									let filterValue="";
									if(allow.indexOf(".")>-1){
										filterValue=allow;
									} else {
										filterValue=model + `.` + allow;
									}
									filterArray.push(filterValue + ` IN (` + whereIn.join(',') +`)`);
								}
							}else{
								const operator=changeOperator[allow];
								let filterValue="";
								if(allow.indexOf(".")>-1){
									filterValue=allow;
								} else {
									filterValue=model + `.` + allow;
								}
								if(operator){
									filterValue+= ` `+operator+` '` + input.filter[key] + `'`;
								} else {
									filterValue+= ` = '` + input.filter[key] + `'`;
								}
								if(input.filter[key]) {
									let passedTest=false;
									if(Array.isArray(input.filter[key]) || typeof input.filter[key] === "string"){
										if(input.filter[key].length>0){
											passedTest=true;
										}
									} else if(typeof input.filter[key] === "number"){
										passedTest=true;
									}
									if(passedTest) {
										filterArray.push(filterValue);
									}
								}
							}
						}
					}
				});
			}
		});

	return filterArray;
}

export function manualGenerateOrder( input, model, allowedOrder = [] ) {
	let orderCondition = '';
	Object.keys(input.orderBy)
		.forEach(function eachKey(key) {
			allowedOrder.map ( allow =>{
				if(input.orderBy.hasOwnProperty(allow)){
					orderCondition = model + `.` + allow + ` ` + input.orderBy[allow];
				}
			})
		});

	return orderCondition;
}

export function generateDefaultMappingRow( data ) {
	const result = {};

	Object.keys(data.dataValues)
		.forEach(function eachKey(key) {
			if( typeof data.dataValues[key] !== 'object') {
				result[key] = data.dataValues[key] ? data.dataValues[key] : null;
			} else if( data.dataValues[key] === null) {
				result[key] = null;
			}
		});

	return result;
}
