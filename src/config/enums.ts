export enum UserRoles {
	USER = "USER",
	SUBSCRIBER = "SUBSCRIBER",
	ADMIN = "ADMIN",
	SUPER_ADMIN = "SUPER_ADMIN",
}

export enum Candlestick {
	oneHour = "1HR",
	twoHours = "2HRS",
	fourHours = "4HRS",
	eightHours = "8HRS",
	twelveHours = "12HRS",
	oneDay = "1D",
	threeDays = "3D",
	oneWeek = "1W",
}

export enum SignalRisk {
	low = "LOW",
	medium = "MEDIUM",
	high = "HIGH",
}

export enum SignalStatus {
	ACTIVE = "ACTIVE",
	PAUSED = "PAUSED",
	INACTIVE = "INACTIVE",
}

export enum TradeStatus {
	active = "ACTIVE",
	inactive = "INACTIVE",
}

export enum Category {
	FOREX = "FOREX",
	CRYPTO = "CRYPTO",
}

export enum TradeType {
	SPOT = "SPOT",
	FUTURES = "FUTURES",
}

export enum TradeSide {
	SHORT = "SHORT",
	LONG = "LONG",
}

export enum ConnectionType {
	MANUAL = "MANUAL",
	FAST = "FAST",
}
