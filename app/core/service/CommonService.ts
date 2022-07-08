export async function getList(modelName: string, limit: number = 10, offset: number = 0, filter: any[] = [], sortList: any[] = []) {
	let orderBy = 'createdAt DESC';
	if (sortList && sortList instanceof Array) {
		orderBy = '';
		for (const sort of sortList) {
			if (sort !== '0') orderBy += ', ';
			orderBy += sortList[sort][0] + ' ' + sortList[sort][1];
		}
		if (!orderBy) orderBy = 'id desc';
	}

	const dataList = await this.getModel(modelName)
		.query()
		.where(function() {
			if (filter && filter instanceof Array) {
				for (const filterItem of filter) {
					const filterType = filterItem.type;
					if (filterType === 'where') {
						this.where(filterItem.name, filterItem.value);
					} else if (filterType === 'whereBetween') {
						this.whereBetween(filterItem.name, filterItem.value);
					} else if (filterType === 'whereIn') {
						this.whereIn(filterItem.name, filterItem.value);
					} else if (filterType === 'whereLike') {
						this.where(filterItem.name, 'like', '%' + filterItem.value + '%');
					}
				}
			}
		})
		.orderByRaw(orderBy)
		.limit(limit)
		.offset(offset);

	return dataList;
}
