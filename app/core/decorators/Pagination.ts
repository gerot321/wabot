import {Datatable} from '../constant/Datatable';
import {PaginationOption} from '../class/Datatable';

export function UsePagination(customOptions?: PaginationOption) {
	return  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const original = descriptor.value;
		Reflect.defineMetadata('wave:pagination:ready', true, target);
		descriptor.value = async function(...args: any[]) {
			const targetOptions = Reflect.getMetadata('wave:pagination', target);
			if (targetOptions === undefined) throw new Error(`@UsePagination should have '@Pagination' parameter decorator`);
			const targetBody: number = args.findIndex(x => x.dataPerPage !== undefined);
			let perPageCount;
			let pageIndex;
			if (args[targetBody]) {
				perPageCount = args[targetBody].dataPerPage;
				pageIndex = args[targetBody].pageCurrent;
				pageIndex -= 1;
			}

			const limit = customOptions && customOptions.limit ? customOptions.limit : Datatable.DEFAULT_LIMIT_PAGE;
			const offset = customOptions && customOptions.offset ? customOptions.offset : 0;
			const options: any = {
				limit,
				offset
			};

			if(perPageCount && perPageCount > 0) {
				options.limit = parseInt(perPageCount);
				if (pageIndex && pageIndex > 0) options.offset = parseInt(perPageCount) * parseInt(pageIndex);
			}
			options.limit = customOptions.noLimit ? 90000 : options.limit;
			args.splice(targetOptions, 0, options);
			const originalApply = await original.apply(this, args);

			if(originalApply.data && originalApply.data.list && customOptions && customOptions.metadata) {
				originalApply.data.pageCurrent = customOptions.noLimit ? 1 : (perPageCount ? pageIndex + 1 : null);
				originalApply.data.pageTotal = originalApply.data.countTotal && perPageCount ? Math.ceil(originalApply.data.countTotal / perPageCount) : 1;
			}

			return originalApply;
		};
		return descriptor;
	}
}

export function Pagination() {
	return (target: any, key: string, index: number) => {
		Reflect.defineMetadata('wave:pagination', index, target);
		setTimeout(() => { // run only on first compile
			if(!Reflect.getMetadata('wave:pagination:ready', target)) throw new Error(`@Pagination should apply '@UsePagination' decorator.`);
		}, 1);
	}
}


