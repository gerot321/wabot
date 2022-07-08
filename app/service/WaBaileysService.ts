import makeWASocket, {
	BufferJSON,
	DisconnectReason, MessageType, MessageUpdateType,
	proto, useSingleFileAuthState,
	WAMessage,
	WAMessageUpdate
} from '@adiwajshing/baileys-md'
import { Boom } from '@hapi/boom'
import {combineTableNames} from 'sequelize/types/lib/utils';
import {RedisConstant} from '../constant/RedisContant';
import {System} from '../core';
import {RedisHCache} from '../core/decorators/RedisHCache';
import {ValidationError} from '../core/error/ErrorClass';
import {RedisService} from '../core/service/RedisService';
import {Account} from '../model/Account';
import Chat = proto.Chat;
import {Subscriber} from '../model/Subscriber';
import {NormalizeService} from './NormalizeService';
import WebMessageInfo = proto.WebMessageInfo;
import Message = proto.Message;

export class WaBaileysService {
	static sockets = {};
	static conns = {};
	static async getSocket(sessionName?: string){
		if (!sessionName) sessionName = 'main';

		let socket = this.sockets[sessionName];

		if (!socket){
			
			const { state, saveState } = useSingleFileAuthState(`./auth_info_multi_${sessionName}.json`)
			socket = makeWASocket({
				auth: state,
				printQRInTerminal: false,
				version: [2,2204,13],
				connectTimeoutMs : 10000
			})

			// const account = await Account.findOne({
			// 	where: {
			// 		sessionName
			// 	},
			// 	include: [Subscriber]
			// });

			socket.ev.on('creds.update', saveState)
			socket.ev.on('connection.update', async (update) => {
				const { connection, lastDisconnect , qr} = update
				if(connection === 'close') {
					const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
					console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
					// reconnect if not logged out
					if(shouldReconnect) {
						delete this.sockets[sessionName];
						this.getSocket(sessionName);
					}
				} else if(connection === 'open') {
					console.log('opened connection')
					console.log(qr)
				}
				if(qr){
					const QRCode = require('qrcode')
					QRCode.toDataURL(qr).then((url) => {
						console.log(Date.now())
					})
				}
			})
			socket.ev.on('chats.set', (obj: { chats: Chat[], isLatest: boolean }) => {
				console.log('chats.set');
				console.log(JSON.stringify(obj));
			})
			socket.ev.on('chats.update', (chats: Array<Partial<Chat>>) => {
				console.log('chats.update');
				console.log(JSON.stringify(chats));
			})
			socket.ev.on('messages.update', (messages: WAMessageUpdate[]) => {
				console.log('messages.update')
				console.log(JSON.stringify(messages));
			})
			socket.ev.on('messages.upsert', async (messageUpsert: { messages: WAMessage[], type: MessageUpdateType }) => {
				// for (const messageObj of messageUpsert.messages){
				// 	if (messageObj.key.participant.startsWith(account.phone.toString())) continue;
				// 	if (!messageObj.message) continue;
				// 	if (messageObj.message.conversation || (messageObj.message.extendedTextMessage && messageObj.message.extendedTextMessage.text)){
				//
				// 		const normalizedMessage = NormalizeService.appendSimplifyMessage(messageObj, account);
				// 		for (const subscriber of account.subscribers) {
				// 			RedisService.publish({
				// 				key: subscriber.client,
				// 				data: normalizedMessage
				// 			});
				// 		}
				// 	}
				// }
				console.log('messages.upsert')
				console.log(JSON.stringify(messageUpsert));
			})

			this.sockets[sessionName] = socket;
		}
		return socket;
	}

	static async send(group: any, message: string, quotedMessage?:any, sessionName?: string) {
		if (!sessionName) sessionName = 'main';
		if (!group || !group.id) throw new ValidationError('chatId not found');
		if (!message) throw new ValidationError('message not found');
		const socket = await this.getSocket(sessionName);
		if (!message) throw new ValidationError('Session not available yet');

		const participantsClean = [];
		for(const participant of group.participants){
			participantsClean.push(participant.id.split(':')[0].split('@')[0]);
		}

		const mentions = [];
		for(const tokenized of message.split(' ')){
			if (!tokenized.startsWith('@')) continue;
			if (tokenized.split('@').length  != 2) continue;

			const isNumber = /^\d+$/.test(tokenized.split('@')[1]);
			if (!isNumber) continue;

			const numberOnly = tokenized.split('@')[1];
			if(participantsClean.indexOf(numberOnly) == -1) continue;

			mentions.push(`${numberOnly}@s.whatsapp.net`);
		}

		const quote : any = {};
		if (quotedMessage){
			delete quotedMessage.simplify;
			quotedMessage.message = new Message(quotedMessage.message);
			quote.quoted = quotedMessage;
		}
		await socket.sendMessage(group.id, {
			text: message,
			mentions
		},
			quote)
	}

	static async getChatIdByPhone(phone: string): Promise<string> {
		phone.replace('+', '');
		return `${phone}@s.whatsapp.net`;
	}

	@RedisHCache({
		key : RedisConstant.CACHE.GROUP.BYNAME
	})
	static async getGroupByGroupName(groupName: string, sessionName: string): Promise<any> {
		if (!sessionName) sessionName = 'main';

		const list = await this.getGroupList(sessionName);
		let group;
		for (const groupItem of list){
			if (groupItem.name === groupName){
				group = groupItem
			}
		}

		if (!group) throw new ValidationError(`Group ${groupName} not found`);

		return group;
	}

	@RedisHCache({
		key : RedisConstant.CACHE.GROUP.LIST,
		expireTime: 2 * 60 * 60
	})
	private static async getGroupList(sessionName?: string): Promise<any[]> {
		if (!sessionName) sessionName = 'main';
		const groups = [];
		const socket = await this.getSocket(sessionName);
		const groupsRaw = await socket.groupFetchAllParticipating();

		for (const groupId in groupsRaw) {
			const group = groupsRaw[groupId];
			groups.push({
				id: group.id,
				name: group.subject,
				participants: group.participants
			});
		}

		return groups;
	}

}
