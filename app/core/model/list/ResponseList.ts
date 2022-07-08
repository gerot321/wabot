import { IsArray, IsInt } from 'class-validator';

export class ResponseList {
	@IsArray() list: any[];
	@IsInt() pageCurrent: number;
	@IsInt() pageTotal: number;
	@IsInt() countTotal: number;
}
