export type WeeklyEarningsData = {
  day: string;
  earnings: number;
};

export type WeeklyEarningsResponse = {
  data: WeeklyEarningsData[];
  totalEarnings: number;
  comparisonPercentage: number;
};
