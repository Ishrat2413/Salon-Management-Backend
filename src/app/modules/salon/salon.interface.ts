export interface ISalonCreatePayload {
  name: string;
  address: string;
  managerId?: string;
}

export interface ISalonUpdatePayload {
  name?: string;
  address?: string;
  managerId?: string;
  managerIds?: string[];
}

export interface ISalonFilterParams {
  searchTerm?: string;
}
