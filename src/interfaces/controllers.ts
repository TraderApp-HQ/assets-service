export interface ICoin {
	id: number;
	name: string;
	slug: string;
	symbol: string;
	description: string;
	logo: string;
	urls: string;
	dateLaunched: Date;
	isCoinActive: boolean;
	isTradingActive: boolean;
	rank: number;
}
export interface IPagedResultData {
	currentPage: number;
	itemsCount: number;
	pageCount: number;
	rowsPerPage: number;
	sortBy: string;
	orderBy: string;
	coins: ICoin[];
}

export interface IQueryParameter {
	args: any;
	query: any;
	operations: any;
	model: any;
}
