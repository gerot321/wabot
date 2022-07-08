export class PaginationOption {
	limit?: number;
	offset?: number;
	metadata?: boolean;
	noLimit?: boolean;
}

export class DatatableResponse {
	list: any[];
	dataPerPage: number;
	pageCurrent: number;
	pageTotal: number;
	countTotal: number;
}

export class DatatableRequest {
	dataPerPage: number;
	pageCurrent: number;
	filter: any;
	orderBy: any;
}
