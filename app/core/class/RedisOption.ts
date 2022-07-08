export class RedisOption {
	key : string;
	hashKey? : string;
	data? : any;
	defaultValue? : any;
	expireTime? : number;
	appendUpdatedAt? : boolean;
	appendKeyWithDate? : boolean;
	channelIndex? : number;
}
