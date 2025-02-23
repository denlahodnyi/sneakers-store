export class AnalyticsSummaryResponseDto {
  totalRevenue: string;
  avgRevenue: string;
  totalOrders: number;
  productsInStock: number;
  unitsInStock: number;
  bestSellingProducts: { name: string; count: number }[];
  yearOverview: {
    yearMonth: string;
    formattedRevenue: string;
    revenue: number;
    date: string;
  }[];
}
