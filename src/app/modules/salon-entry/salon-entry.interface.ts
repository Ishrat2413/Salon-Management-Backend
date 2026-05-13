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
