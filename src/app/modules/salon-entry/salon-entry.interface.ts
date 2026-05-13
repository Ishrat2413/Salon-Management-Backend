export interface ISplitEntryPayload {
  employeeId: string;
  totalPrice: number;
  tips?: number;
}

export interface ISalonEntryCreatePayload {
  employeeId: string;
  salonId: string;
  serviceId: string;
  totalPrice: number;
  tips?: number;
  addHair?: number;
  notes?: string;
  isSplit?: boolean;
  splits?: ISplitEntryPayload[];
}

export interface ISalonEntryFilterParams {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  salonId?: string;
}

