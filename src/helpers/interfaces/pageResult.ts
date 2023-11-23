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
    args: object,
    query: object,
    operations: object,
    model: object
  }