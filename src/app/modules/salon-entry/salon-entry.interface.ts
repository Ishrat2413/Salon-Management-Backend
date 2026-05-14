export interface ISplitEntryPayload {
  employeeId: string;
  totalPrice: number;
  tips?: number;
}

export interface ISalonEntryCreatePayload {
  employeeId: string;
  salonId: string;
  serviceId: string;
  clientName?: string;
  totalPrice: number;
  tips?: number;
  addHair?: number;
  notes?: string;
  isSplit?: boolean;
  splits?: ISplitEntryPayload[];
}

export interface ISalonEntryUpdatePayload {
  employeeId?: string;
  salonId?: string;
  serviceId?: string;
  clientName?: string;
  totalPrice?: number;
  tips?: number;
  addHair?: number;
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusComment?: string;
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

export interface IChangeSalonEntryStatusPayload {
  status: 'APPROVED' | 'REJECTED';
  statusComment?: string;
}


