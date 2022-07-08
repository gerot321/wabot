export function Promisify(){
	return (klass: any, methodName: string, desc: any) => {
		const origMethod = desc.value;
		desc.value = async function(...args: any[]) {
			const resp = await origMethod.apply(this, args);
			return Promise.resolve(resp);
		};
		return desc;
	}
}
