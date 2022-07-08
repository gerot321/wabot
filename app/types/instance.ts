import axios from "axios";
import Chat = proto.Chat;
import uuidv4 = require('uuid')

import makeWASocket, {
	BufferJSON,
	DisconnectReason, MessageType, MessageUpdateType,
	proto, useSingleFileAuthState,
	WAMessage,
	WAMessageUpdate
} from '@adiwajshing/baileys-md'
import {logger} from "sequelize/types/lib/utils/logger";
import {config} from "../common/config";
import {downloadMessage} from "../helper/downloadMsg";
import {generateVC} from "../helper/genVc";
export class WhatsAppInstance {
		socketConfig = {
			printQRInTerminal: false,
			version: [2,2204,13],
			auth: undefined,
			browser: undefined,
		}
		key = ''
		authState
		allowWebhook = false
		instance = {
				key: this.key,
				chats: [],
				qr: '',
				messages: [],
				qrRetry: 0, sock: undefined,
				online: undefined,
		}

		axiosInstance = axios.create({
				baseURL: config.webhookUrl,
		})

		constructor(key) {
				this.key = key ? key : uuidv4()
		}

		async SendWebhook(data) {
				if (!this.allowWebhook) return
				this.axiosInstance.post('', data).catch(() => {})
		}

		async init() {
				// this.collection = mongoClient.db('whatsapp-api').collection(this.key)
				const { state, saveState } = useSingleFileAuthState(`./auth_info_multi_${this.key}.json`)
				this.authState = { state, saveState }
				this.socketConfig.auth = this.authState.state
				this.socketConfig.browser = Object.values(config.browser)
				this.instance.sock = makeWASocket({
					printQRInTerminal: false,
					version: [2,2204,13],
					auth: this.socketConfig.auth,
					browser: this.socketConfig.browser,
				})
				this.setHandler()
				return this
		}

		setHandler() {
				const sock = this.instance.sock
				// on credentials update save state
				sock?.ev.on('creds.update', this.authState.saveState)

				// on socket closed, opened, connecting
				sock?.ev.on('connection.update', async (update) => {
						const { connection, lastDisconnect, qr } = update

						if (connection === 'connecting') return

						if (connection === 'close') {
								// reconnect if not logged out
								if (
										lastDisconnect?.error?.output?.statusCode !==
										DisconnectReason.loggedOut
								) {
										await this.init()
								} else {
										// await this.collection.drop().then((r) => {
										// 		logger.info('STATE: Droped collection')
										// })
										this.instance.online = false
								}
						} else if (connection === 'open') {
								// if (config.mongoose.enabled) {
								// 		const alreadyThere = await Chat.findOne({
								// 				key: this.key,
								// 		}).exec()
								// 		if (!alreadyThere) {
								// 				const saveChat = new Chat({ key: this.key })
								// 				await saveChat.save()
								// 		}
								// }
								this.instance.online = true
						}

						if (qr) {
							const QRCode = require('qrcode')

							QRCode.toDataURL(qr).then((url) => {
										this.instance.qr = url
										this.instance.qrRetry++
										if (this.instance.qrRetry >= config.instance.maxRetryQr) {
												// close WebSocket connection
												this.instance.sock.ws.close()
												// remove all events
												this.instance.sock.ev.removeAllListeners()
												this.instance.qr = ' '
										}
								})
						}
				})

				// on receive all chats
				sock?.ev.on('chats.set', async ({ chats }) => {
						const recivedChats = chats.map((chat) => {
								return {
										...chat,
										messages: [],
								}
						})
						this.instance.chats.push(...recivedChats)
						// await this.updateDb(this.instance.chats)
				})

				// on recive new chat
				sock?.ev.on('chats.upsert', (newChat) => {
						// console.log(newChat)
						// console.log("Received new chat")
						const chats = newChat.map((chat) => {
								return {
										...chat,
										messages: [],
								}
						})
						this.instance.chats.push(...chats)
				})

				// on chat change
				sock?.ev.on('chats.update', (changedChat) => {
						changedChat.map((chat) => {
								const index = this.instance.chats.findIndex(
										(pc) => pc.id === chat.id
								)
								const PrevChat = this.instance.chats[index]
								this.instance.chats[index] = {
										...PrevChat,
										...chat,
								}
						})
				})

				// on chat delete
				sock?.ev.on('chats.delete', (deletedChats) => {
						deletedChats.map((chat) => {
								const index = this.instance.chats.findIndex(
										(c) => c.id === chat
								)
								this.instance.chats.splice(index, 1)
						})
				})

				// on new mssage
				sock?.ev.on('messages.upsert', (m) => {
						// console.log(m)
						if (m.type === 'prepend') {
								this.instance.messages.unshift(...m.messages)
						}
						if (m.type !== 'notify') return

						this.instance.messages.unshift(...m.messages)

						m.messages.map(async (msg) => {
								if (!msg.message) return
								if (msg.key.fromMe) return

								const messageType = Object.keys(msg.message)[0]
								if (
										[
												'protocolMessage',
												'senderKeyDistributionMessage',
										].includes(messageType)
								) {
										return
								}

								const webhookData = {
										key: this.key,
										...msg,
								}

								if (messageType === 'conversation') {
										webhookData['text'] = m
								}
								if (config.webhookBase64) {
										switch (messageType) {
												case 'imageMessage':
														webhookData['msgContent'] = await downloadMessage(
																msg.message.imageMessage,
																'image'
														)
														break
												case 'videoMessage':
														webhookData['msgContent'] = await downloadMessage(
																msg.message.videoMessage,
																'video'
														)
														break
												case 'audioMessage':
														webhookData['msgContent'] = await downloadMessage(
																msg.message.audioMessage,
																'audio'
														)
														break
												default:
														webhookData['msgContent'] = ''
														break
										}
								}

								await this.SendWebhook(webhookData)
						})
				})

				// sock?.ev.on('messages.update', async (messages) => {
				//  console.dir(messages);
				//  for (const message of messages) {
				//    is_delivered = message?.update?.status === 3;
				//    is_seen = message?.update?.status === 4
				//  }
				// })

				sock?.ev.on('groups.upsert', async (newChat) => {
						// console.log(newChat)
						// this.createGroupByApp(newChat)
				})

				sock?.ev.on('groups.update', async (newChat) => {
						// console.log(newChat)
						// this.updateGroupByApp(newChat)
				})
		}

		async getInstanceDetail(key) {
				return {
						instance_key: key,
						phone_connected: this.instance?.online,
						user: this.instance?.online ? this.instance.sock?.user : {},
				}
		}

		getWhatsAppId(id) {
				if (id.includes('@g.us') || id.includes('@s.whatsapp.net')) return id
				return id.includes('-') ? `${id}@g.us` : `${id}@s.whatsapp.net`
		}

		async verifyId(id) {
				if (id.includes('@g.us')) return true
				const [result] = await this.instance.sock?.onWhatsApp(id)
				if (result?.exists) return true
				throw new Error('no account exists')
		}

		async sendTextMessage(to, message) {
				await this.verifyId(this.getWhatsAppId(to))
				const data = await this.instance.sock?.sendMessage(
						this.getWhatsAppId(to),
						{ text: message }
				)
				return data
		}

		async sendMediaFile(to, file, type, caption = '', filename) {
				await this.verifyId(this.getWhatsAppId(to))
				const data = await this.instance.sock?.sendMessage(
						this.getWhatsAppId(to),
						{
								mimetype: file.mimetype,
								[type]: file.buffer,
								caption,
								ptt: type === 'audio' ? true : false,
								fileName: filename ? filename : file.originalname,
						}
				)
				return data
		}

		async sendUrlMediaFile(to, url, type, mimeType, caption = '') {
				await this.verifyId(this.getWhatsAppId(to))

				const data = await this.instance.sock?.sendMessage(
						this.getWhatsAppId(to),
						{
								[type]: {
										url,
								},
								caption,
								mimetype: mimeType,
						}
				)
				return data
		}

		async DownloadProfile(of) {
				await this.verifyId(this.getWhatsAppId(of))
				const ppUrl = await this.instance.sock?.profilePictureUrl(
						this.getWhatsAppId(of),
						'image'
				)
				return ppUrl
		}

		async getUserStatus(of) {
				await this.verifyId(this.getWhatsAppId(of))
				const status = await this.instance.sock?.fetchStatus(
						this.getWhatsAppId(of)
				)
				return status
		}

		async blockUnblock(to, data) {
				await this.verifyId(this.getWhatsAppId(to))
				const status = await this.instance.sock?.updateBlockStatus(
						this.getWhatsAppId(to),
						data
				)
				return status
		}

		// async sendButtonMessage(to, data) {
		// 		await this.verifyId(this.getWhatsAppId(to))
		// 		const result = await this.instance.sock?.sendMessage(
		// 				this.getWhatsAppId(to),
		// 				{
		// 						templateButtons: processButton(data.buttons),
		// 						text: data.text ?? '',
		// 						footer: data.footerText ?? '',
		// 				}
		// 		)
		// 		return result
		// }

		async sendContactMessage(to, data) {
				await this.verifyId(this.getWhatsAppId(to))
				const vcard = generateVC(data)
				const result = await this.instance.sock?.sendMessage(
						await this.getWhatsAppId(to),
						{
								contacts: {
										displayName: data.fullName,
										contacts: [{ displayName: data.fullName, vcard }],
								},
						}
				)
				return result
		}

		async sendListMessage(to, data) {
				await this.verifyId(this.getWhatsAppId(to))
				const result = await this.instance.sock?.sendMessage(
						this.getWhatsAppId(to),
						{
								text: data.text,
								sections: data.sections,
								buttonText: data.buttonText,
								footer: data.description,
								title: data.title,
						}
				)
				return result
		}

		// async sendMediaButtonMessage(to, data) {
		// 		await this.verifyId(this.getWhatsAppId(to))
		//
		// 		const result = await this.instance.sock?.sendMessage(
		// 				this.getWhatsAppId(to),
		// 				{
		// 						[data.mediaType]: {
		// 								url: data.image,
		// 						},
		// 						footer: data.footerText ?? '',
		// 						caption: data.text,
		// 						templateButtons: processButton(data.buttons),
		// 						mimetype: data.mimeType,
		// 				}
		// 		)
		// 		return result
		// }

		async setStatus(status, to) {
				await this.verifyId(this.getWhatsAppId(to))

				const result = await this.instance.sock?.sendPresenceUpdate(status, to)
				return result
		}

		// Group Methods
		// parseParticipants(users) {
		// 		return users.map((users) => this.getWhatsAppId(users))
		// }

		async createNewGroup(name, users) {
				const group = await this.instance.sock?.groupCreate(
						name,
						users.map(this.getWhatsAppId)
				)
				return group
		}

		// async addNewParticipant(id, users) {
		// 		try {
		// 				const res = await this.instance.sock?.groupAdd(
		// 						this.getWhatsAppId(id),
		// 						this.parseParticipants(users)
		// 				)
		// 				return res
		// 		} catch {
		// 				return {
		// 						error: true,
		// 						message:
		// 								'Unable to add participant, you must be an admin in this group',
		// 				}
		// 		}
		// }
		//
		// async makeAdmin(id, users) {
		// 		try {
		// 				const res = await this.instance.sock?.groupMakeAdmin(
		// 						this.getWhatsAppId(id),
		// 						this.parseParticipants(users)
		// 				)
		// 				return res
		// 		} catch {
		// 				return {
		// 						error: true,
		// 						message:
		// 								'unable to promote some participants, check if you are admin in group or participants exists',
		// 				}
		// 		}
		// }

		// async demoteAdmin(id, users) {
		// 		try {
		// 				const res = await this.instance.sock?.groupDemoteAdmin(
		// 						this.getWhatsAppId(id),
		// 						this.parseParticipants(users)
		// 				)
		// 				return res
		// 		} catch {
		// 				return {
		// 						error: true,
		// 						message:
		// 								'unable to demote some participants, check if you are admin in group or participants exists',
		// 				}
		// 		}
		// }

		// async getAllGroups() {
		// 		const Chats = await this.getChat()
		// 		return Chats.filter((c) => c.id.includes('@g.us')).map((data, i) => {
		// 				return { index: i, name: data.name, jid: data.id, participant: data.participant }
		// 		})
		// }
		//
		// async leaveGroup(id) {
		// 		const Chats = await this.getChat()
		// 		const group = Chats.find((c) => c.id === id)
		// 		if (!group) throw new Error('no group exists')
		// 		return await this.instance.sock?.groupLeave(id)
		// }
		//
		// async getInviteCodeGroup(id) {
		// 		const Chats = await this.getChat()
		// 		const group = Chats.find((c) => c.id === id)
		// 		if (!group) {
		// 				throw new Error(
		// 						'unable to get invite code, check if the group exists'
		// 				)
		// 		}
		// 		return await this.instance.sock?.groupInviteCode(id)
		// }

		// get Chat object from db
		// async getChat(key = this.key) {
		// 		// const dbResult = await Chat.findOne({ key }).exec()
		// 		const ChatObj = dbResult.chat
		// 		return ChatObj
		// }

		// create new group by application
		// async createGroupByApp(newChat){
		// 	const Chats = await this.getChat()
		// 	const group = {
		// 		id: newChat[0].id,
		// 		name: newChat[0].subject,
		// 		participant: newChat[0].participants,
		// 		messages: []
		// 	}
		// 	Chats.push(group)
		// 	try {
		// 		await this.updateDb(Chats)
		// 	} catch (e) {
		// 			logger.error('Error updating document failed')
		// 	}
		// }

		// async updateGroupByApp(newChat){
		// 	const Chats = await this.getChat()
		// 	Chats.find((c) => c.id === newChat[0].id).name = newChat[0].subject
		// 	try {
		// 			await this.updateDb(Chats)
		// 	} catch (e) {
		// 			logger.error('Error updating document failed')
		// 	}
		// }

		async groupFetchAllParticipating(){
			const result = await this.instance.sock?.groupFetchAllParticipating()
			return result
		}

		// update db document -> chat
		// async updateDb(object) {
		// 		try {
		// 				await Chat.updateOne({ key: this.key }, { chat: object })
		// 		} catch (e) {
		// 				logger.error('Error updating document failed')
		// 		}
		// }

}

exports.WhatsAppInstance = WhatsAppInstance
