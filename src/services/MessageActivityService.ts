import { AssetData, WSChannel } from "../config/enums";

export class MessageActivityService {
	private static instance: MessageActivityService;
	private readonly env: string;
	private readonly lastMessageTimestamps: Map<string, number>;

	private constructor() {
		this.env = process.env.NODE_ENV as string;
		this.lastMessageTimestamps = new Map();
	}

	public static getInstance(): MessageActivityService {
		if (!MessageActivityService.instance) {
			MessageActivityService.instance = new MessageActivityService();
		}
		return MessageActivityService.instance;
	}

	public updateLastMessageTimestamp(signalId: string, type: AssetData): void {
		const key = `${this.env}_${WSChannel.binanceWs}_${type}_${signalId}`;
		this.lastMessageTimestamps.set(key, Date.now());
	}

	public getLastMessageTimestamp(signalId: string, type: AssetData): number | undefined {
		const key = `${this.env}_${WSChannel.binanceWs}_${type}_${signalId}`;
		return this.lastMessageTimestamps.get(key);
	}

	public isMessageStale(signalId: string, type: AssetData, maxAgeMs: number): boolean {
		const lastTimestamp = this.getLastMessageTimestamp(signalId, type);
		if (!lastTimestamp) return true;
		return Date.now() - lastTimestamp > maxAgeMs;
	}
}
