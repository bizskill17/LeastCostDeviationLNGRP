
export interface DeviationRecord {
  id: string;
  date: string;
  jobNo: string;
  companyName: string;
  itemName: string;
  erpCode: string;
  planQty: number;
  ffgPrinting: number;
  sheetWeight: number;
  rate: number;
  remarks: string;
  // Optional pre-calculated fields from sheet
  sheetLeastSheetWeight?: number;
  sheetLeastSheetWeightDate?: string;
  sheetDifference?: number;
  sheetLeastJobNo?: string;
  sheetWeightLoss?: number;
  sheetAmount?: number;
}

export interface ComputedDeviationRecord extends DeviationRecord {
  leastSheetWeight: number;
  leastSheetWeightDate: string;
  leastJobNo: string;
  difference: number;
  weightLoss: number;
  amount: number;
}

export type SortField = keyof ComputedDeviationRecord;
export type SortOrder = 'asc' | 'desc';

export interface DashboardStats {
  totalLossAmount: number;
  avgDeviationPercentage: number;
  totalWeightLoss: number;
  criticalJobsCount: number;
}
