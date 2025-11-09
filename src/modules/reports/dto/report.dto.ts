export class VatReportDto {
  companyId: string;
  startDate: Date;
  endDate: Date;
}

export class ProfitLossReportDto {
  companyId: string;
  startDate: Date;
  endDate: Date;
}

export class BalanceSheetReportDto {
  companyId: string;
  asOfDate: Date;
}

export class CashFlowReportDto {
  companyId: string;
  startDate: Date;
  endDate: Date;
}