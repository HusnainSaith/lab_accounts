import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from '../../invoices/entities/invoice.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { VatReportDto, ProfitLossReportDto, BalanceSheetReportDto, CashFlowReportDto } from '../dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async generateVatReport(vatReportDto: VatReportDto) {
    this.validateDateRange(vatReportDto.startDate, vatReportDto.endDate);

    const invoices = await this.invoicesRepository.find({
      where: {
        companyId: vatReportDto.companyId,
        issueDate: Between(vatReportDto.startDate, vatReportDto.endDate)
      },
      relations: ['customer'],
      order: { issueDate: 'ASC' }
    });

    const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);
    const totalSales = paidInvoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const totalVat = paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0);
    const totalGross = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return {
      period: { start: vatReportDto.startDate, end: vatReportDto.endDate },
      summary: {
        totalSales,
        totalVat,
        totalGross,
        invoiceCount: paidInvoices.length,
        averageInvoiceValue: paidInvoices.length > 0 ? totalGross / paidInvoices.length : 0
      },
      invoices: paidInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.issueDate,
        customer: inv.customer?.name || 'Unknown',
        subtotal: Number(inv.subtotal),
        vatAmount: Number(inv.vatAmount),
        total: Number(inv.totalAmount)
      }))
    };
  }

  async generateProfitLossReport(profitLossDto: ProfitLossReportDto) {
    this.validateDateRange(profitLossDto.startDate, profitLossDto.endDate);

    const [paidInvoices, allInvoices] = await Promise.all([
      this.invoicesRepository.find({
        where: {
          companyId: profitLossDto.companyId,
          issueDate: Between(profitLossDto.startDate, profitLossDto.endDate),
          status: InvoiceStatus.PAID
        }
      }),
      this.invoicesRepository.find({
        where: {
          companyId: profitLossDto.companyId,
          issueDate: Between(profitLossDto.startDate, profitLossDto.endDate)
        }
      })
    ]);

    const revenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const vatCollected = paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0);
    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);

    return {
      period: { start: profitLossDto.startDate, end: profitLossDto.endDate },
      income: {
        revenue,
        totalInvoiced,
        collectionRate: totalInvoiced > 0 ? (revenue / totalInvoiced) * 100 : 0
      },
      expenses: {
        total: 0 // Would need expense tracking implementation
      },
      profitLoss: {
        grossProfit: revenue,
        netProfit: revenue,
        profitMargin: revenue > 0 ? 100 : 0
      },
      taxes: {
        vatCollected
      }
    };
  }

  async generateBalanceSheet(balanceSheetDto: BalanceSheetReportDto) {
    const paidInvoices = await this.invoicesRepository.find({
      where: {
        companyId: balanceSheetDto.companyId,
        status: InvoiceStatus.PAID
      }
    });

    const unpaidInvoices = await this.invoicesRepository.find({
      where: {
        companyId: balanceSheetDto.companyId,
        status: InvoiceStatus.SENT
      }
    });

    const cash = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const accountsReceivable = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return {
      asOfDate: balanceSheetDto.asOfDate,
      assets: {
        currentAssets: {
          cash,
          accountsReceivable,
          total: cash + accountsReceivable
        }
      },
      liabilities: {
        currentLiabilities: {
          vatPayable: paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0)
        }
      },
      equity: {
        retainedEarnings: cash - paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0)
      }
    };
  }

  async generateCashFlowReport(cashFlowDto: CashFlowReportDto) {
    const invoices = await this.invoicesRepository.find({
      where: {
        companyId: cashFlowDto.companyId,
        paidAt: Between(cashFlowDto.startDate, cashFlowDto.endDate)
      }
    });

    const operatingCashFlow = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return {
      period: { start: cashFlowDto.startDate, end: cashFlowDto.endDate },
      operatingActivities: {
        cashFromCustomers: operatingCashFlow,
        netCashFromOperating: operatingCashFlow
      },
      investingActivities: {
        netCashFromInvesting: 0
      },
      financingActivities: {
        netCashFromFinancing: 0
      },
      netCashFlow: operatingCashFlow
    };
  }

  async generateCustomerReport(companyId: string, startDate: Date, endDate: Date) {
    this.validateDateRange(startDate, endDate);

    const customers = await this.customersRepository.find({
      where: { companyId },
      relations: ['invoices']
    });

    const customerData = await Promise.all(
      customers.map(async (customer) => {
        const invoices = await this.invoicesRepository.find({
          where: {
            customerId: customer.id,
            issueDate: Between(startDate, endDate)
          }
        });

        const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);
        const totalSpent = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

        return {
          customerId: customer.id,
          customerName: customer.name,
          customerType: customer.customerType,
          totalInvoices: invoices.length,
          paidInvoices: paidInvoices.length,
          totalInvoiced,
          totalPaid: totalSpent,
          outstandingAmount: totalInvoiced - totalSpent,
          paymentRate: totalInvoiced > 0 ? (totalSpent / totalInvoiced) * 100 : 0
        };
      })
    );

    return {
      period: { start: startDate, end: endDate },
      customers: customerData.sort((a, b) => b.totalPaid - a.totalPaid),
      summary: {
        totalCustomers: customers.length,
        activeCustomers: customerData.filter(c => c.totalInvoices > 0).length,
        totalRevenue: customerData.reduce((sum, c) => sum + c.totalPaid, 0),
        totalOutstanding: customerData.reduce((sum, c) => sum + c.outstandingAmount, 0)
      }
    };
  }

  private validateDateRange(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxRange) {
      throw new BadRequestException('Date range cannot exceed 1 year');
    }
  }
}