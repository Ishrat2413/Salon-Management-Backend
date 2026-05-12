export interface ISalonCreatePayload {
  name: string;
  address: string;
}

export interface ISalonUpdatePayload {
  name?: string;
  address?: string;
}

export interface ISalonFilterParams {
  searchTerm?: string;
}
