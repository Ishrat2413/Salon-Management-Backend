export interface ISplitEntryPayload {
  employeeId: string;
  totalPrice: number;
  tips?: number;
  splitPercentage?: number;
}

export interface ISalonEntryCreatePayload {
  employeeId: string;
  salonId: string;
  serviceId: string;
  sizeId?: string;
  lengthId?: string;
  clientName?: string;
  totalPrice: number;
  actualPrice?: number;
  tips?: number;
  addHair?: number;
  splitPercentage?: number;
  notes?: string;
  isSplit?: boolean;
  splits?: ISplitEntryPayload[];
}

export interface ISalonEntryUpdatePayload {
  employeeId?: string;
  salonId?: string;
  serviceId?: string;
  sizeId?: string;
  lengthId?: string;
  clientName?: string;
  totalPrice?: number;
  actualPrice?: number;
  tips?: number;
  addHair?: number;
  splitPercentage?: number;
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusComment?: string;
  isSplit?: boolean;
  createdAt?: string;
  splits?: ISplitEntryPayload[];
}

export interface ISalonEntryFilterParams {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  salonId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface IChangeSalonEntryStatusPayload {
  status: 'APPROVED' | 'REJECTED';
  statusComment?: string;
}


