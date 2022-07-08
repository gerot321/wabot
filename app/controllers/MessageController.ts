import {error, success, System} from "../core";
import {
	Body,
	Get,
	JsonController,
	Param, Post,
	Req,
} from "@wavecore/routing-controllers";
import {WaBaileysService} from '../service/WaBaileysService';
import {WhatsAppInstance} from "../types/instance";

@JsonController("/message")
export class MessageController {
	@Get("/test")
	async test(@Req() req: any) {
		return success('');
	}

	@Post("/send")
	async send(@Body() input: any, @Req() req: any) {
		console.log(input);
		const { groupName, message, sessionName, quotedMessage } = input;
		const group = await WaBaileysService.getGroupByGroupName(groupName, sessionName);
		console.log(group.id);
		await WaBaileysService.send(group, message, quotedMessage, sessionName);

		return success('Message successfully sent');
	}
	@Post("/send2")
	async send2(@Body() input: any, @Req() req: any) {
		const { groupName, message, sessionName } = input;
		const group = await WaBaileysService.getGroupByGroupName(groupName, sessionName);
		await WaBaileysService.send(group, message, sessionName);

		return success('Message successfully sent');
	}

	@Post("/connect")
	async connect(@Body() input: any, @Req() req: any) {
		// WaBaileysService.getSocket(input.phone);
		const instance = new WhatsAppInstance(input.key)
		const data = await instance.init()
		global.WhatsAppInstances[input.key] = instance
		await System.sleep(1000);
		return success(	instance.instance.qr);
	}

	@Post("/init")
	async init(@Body() input: any, @Req() req: any) {
		WaBaileysService.getSocket(input.phone);

		return success(	"asd");
	}
}
