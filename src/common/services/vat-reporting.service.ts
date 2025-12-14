import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Invoice } from '../../modules/invoices/entities/invoice.entity';

@Injectable()
export class VatReportingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private dataSource: DataSource,
  ) {}

  /**
   * Generate VAT summary report for a period
   */
  async generateVatSummary(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Get sales data
    const salesData = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.subtotal)', 'totalSales')
      .addSelect('SUM(invoice.vat_amount)', 'vatCollected')
      .addSelect('COUNT(invoice.id)', 'invoiceCount')
      .where('invoice.company_id = :companyId', { companyId })
      .andWhere('invoice.status != :status', { status: 'draft' })
      .andWhere('invoice.supply_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    // Purchase/expense data not available - expenses module missing
    const purchaseData = { totalPurchases: 0, vatPaid: 0, expenseCount: 0 };

    const totalSales = parseFloat(salesData?.totalSales || 0);
    const vatCollected = parseFloat(salesData?.vatCollected || 0);
    const totalPurchases = purchaseData?.totalPurchases || 0;
    const vatPaid = purchaseData?.vatPaid || 0;
    const netVat = vatCollected - vatPaid;

    return {
      period: {
        startDate,
        endDate,
      },
      sales: {
        totalAmount: totalSales,
        vatAmount: vatCollected,
        invoiceCount: parseInt(salesData?.invoiceCount || 0),
      },
      purchases: {
        totalAmount: totalPurchases,
        vatAmount: vatPaid,
        expenseCount: purchaseData?.expenseCount || 0,
      },
      vat: {
        collected: vatCollected,
        paid: vatPaid,
        netPayable: netVat,
        netRefundable: netVat < 0 ? Math.abs(netVat) : 0,
      },
    };
  }

  /**
   * Get sales by VAT category for a period
   */
  async getSalesByVatCategory(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    return this.dataSource.query(
      `
      SELECT
        ii.vat_tag as "vatCategory",
        SUM(ii.line_total) as "totalAmount",
        SUM(ii.vat_amount) as "vatAmount",
        COUNT(DISTINCT i.id) as "invoiceCount",
        AVG(ii.vat_rate) as "averageRate"
      FROM invoice_items ii
      JOIN invoices i ON i.id = ii.invoice_id
      WHERE i.company_id = $1
        AND i.status != 'draft'
        AND i.supply_date BETWEEN $2 AND $3
      GROUP BY ii.vat_tag
      ORDER BY "totalAmount" DESC
      `,
      [companyId, startDate, endDate],
    );
  }

  /**
   * Get sales by customer for a period
   */
  async getSalesByCustomer(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    return this.dataSource.query(
      `
      SELECT
        c.name as "customerName",
        c.name_ar as "customerNameAr",
        c.trn as "customerTrn",
        SUM(i.subtotal) as "totalAmount",
        SUM(i.vat_amount) as "vatAmount",
        COUNT(i.id) as "invoiceCount"
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.company_id = $1
        AND i.status != 'draft'
        AND i.supply_date BETWEEN $2 AND $3
      GROUP BY c.id, c.name, c.name_ar, c.trn
      ORDER BY "totalAmount" DESC
      `,
      [companyId, startDate, endDate],
    );
  }

  /**
   * Get deductible expenses summary for a period
   */
  async getDeductibleExpenses(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Expenses module not available
    return {
      totalAmount: 0,
      vatAmount: 0,
      count: 0,
    };
  }

  /**
   * Get monthly sales trend
   */
  async getMonthlySalesTrend(companyId: string, year: number): Promise<any[]> {
    return this.dataSource.query(
      `
      SELECT
        date_trunc('month', i.supply_date) as "month",
        SUM(i.subtotal) as "totalSales",
        SUM(i.vat_amount) as "vatCollected",
        COUNT(i.id) as "invoiceCount"
      FROM invoices i
      WHERE i.company_id = $1
        AND i.status != 'draft'
        AND EXTRACT(YEAR FROM i.supply_date) = $2
      GROUP BY date_trunc('month', i.supply_date)
      ORDER BY "month" ASC
      `,
      [companyId, year],
    );
  }

  /**
   * Get monthly expense trend
   */
  async getMonthlyExpenseTrend(companyId: string, year: number): Promise<any[]> {
    // Expenses module not available
    return [];
  }

  /**
   * FTA-compliant VAT report format for UAE
   */
  async generateFtaCompliantReport(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const summary = await this.generateVatSummary(companyId, startDate, endDate);
    const salesByCategory = await this.getSalesByVatCategory(
      companyId,
      startDate,
      endDate,
    );

    return {
      reportingPeriod: {
        from: startDate,
        to: endDate,
      },
      totalOutgoingSupplies: summary.sales.totalAmount,
      totalOutgoingVat: summary.vat.collected,
      totalIncomingSupplies: summary.purchases.totalAmount,
      totalInputVat: summary.vat.paid,
      totalVatPayable: Math.max(summary.vat.netPayable, 0),
      totalVatRecoverable: Math.max(-summary.vat.netPayable, 0),
      vatByCategory: salesByCategory.map((cat) => ({
        category: cat.vatCategory,
        supplies: cat.totalAmount,
        vat: cat.vatAmount,
      })),
      qualifyingExpenses: await this.getDeductibleExpenses(
        companyId,
        startDate,
        endDate,
      ),
    };
  }
}
