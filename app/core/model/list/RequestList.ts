import { IsInt, IsOptional } from 'class-validator';

export class RequestList {
	@IsInt() pageCurrent: number;
	@IsInt() dataPerPage: number;

	@IsOptional()
	filter: {
		search: string;
		[name: string]: string;
	};

	@IsOptional()
	orderBy: {
		[name: string]: string;
	};
}
