export interface IServiceCreatePayload {
  name: string;
}

export interface IServiceUpdatePayload {
  name?: string;
}

export interface IServiceFilterParams {
  searchTerm?: string;
}
