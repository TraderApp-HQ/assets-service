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