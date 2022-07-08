import {WAMessage} from '@adiwajshing/baileys-md';
import {Account} from '../model/Account';

export class NormalizeService {
	static appendSimplifyMessage(rawMessage: WAMessage, account: Account){
		const simplifyMessage = {
			messageId: '',
			chatId: '',
			fromName: '',
			fromId: '',
			text: '',
			mentions: [],
			reply: {}
		};

		simplifyMessage.messageId = rawMessage.key.id;
		simplifyMessage.chatId = rawMessage.key.remoteJid;
		simplifyMessage.fromName = rawMessage.pushName;
		simplifyMessage.fromId = rawMessage.key.participant;

		simplifyMessage.text = rawMessage.message.conversation ? rawMessage.message.conversation : rawMessage.message.extendedTextMessage.text;
		simplifyMessage.mentions = rawMessage.message.extendedTextMessage?.contextInfo?.mentionedJid ?? [];
		simplifyMessage.reply = rawMessage.message.extendedTextMessage?.contextInfo?.stanzaId ? rawMessage.message.extendedTextMessage?.contextInfo : null;

		if (simplifyMessage.reply){
			simplifyMessage.reply = JSON.parse(JSON.stringify(simplifyMessage.reply));
			// @ts-ignore
			if (simplifyMessage.reply.participant.startsWith(account.phone)) simplifyMessage.reply.isBot = true;
		}

		return {
			simplify: simplifyMessage,
			...rawMessage
		};
	}

}
