export interface IPagedResult {
    isSuccessful: boolean;
    message: string;
    code: string;
    data: IPagedResultData;
  }

  export interface IPagedResultData {
    currentPage: number;
    itemsCount: number;
    pageCount: number;
    rowsPerPage: number;
    sortBy: string,
    orderBy: string,
    coins: []
  }

  export interface IQueryParameter{
    args: any,
    query: any,
    operations: any,
    model: any
  }