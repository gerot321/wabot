import * as defaultData from './EnvDefault.json';

let envData;
export const SetEnv = envDataInput => {
	envData = envDataInput;
};
export const Env : any = () => {
	return envData ? envData : defaultData;
};
export const isProd = () => {
	return Env().environment === 'production';
};

const configPath = '../../../config/';
export const SetConfigPath = configPathInput => {
	envData = configPathInput;
};
export const GetConfigPath = () => {
	return configPath;
};
