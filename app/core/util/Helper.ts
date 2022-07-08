export function convertPathToUnderscores(pathName) {
	const methodConstant = pathName.toUpperCase().split('/');
	let methodName = '';

	for (const i in methodConstant) {
		if (methodConstant[i].length > 0) {
			if (methodName.length > 0) methodName += '_';
			methodName += methodConstant[i].replace(/[^a-zA-Z0-9]+/g, '_');


		}
	}

	return methodName;
}
export const template = (templateString) => "`"+templateString+"`";
