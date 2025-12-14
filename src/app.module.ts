import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './config/database.config';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { ConstantModule } from './modules/constant/constant.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { InvoiceItemsModule } from './modules/invoice-items/invoice-items.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { FiscalYearsModule } from './modules/fiscal-years/fiscal-years.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { VoucherTypesModule } from './modules/voucher-types/voucher-types.module';
import { JournalEntriesModule } from './modules/journal-entries/journal-entries.module';
import { InvoiceLinesModule } from './modules/invoice-lines/invoice-lines.module';
import { AccountBalancesModule } from './modules/account-balances/account-balances.module';

// Common Services
import { RLSService } from './common/services/rls.service';
import { EncryptionService } from './common/services/encryption.service';
import { RLSMiddleware } from './common/middleware/rls.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),

    // Feature Modules
    AuthModule,
    CompaniesModule,
    UsersModule,
    ConstantModule,
    InvoicesModule,
    InvoiceItemsModule,
    ReportsModule,
    RolesModule,
    PermissionsModule,
    AuditLogsModule,
    RolePermissionsModule,
    FiscalYearsModule,
    AccountsModule,
    VoucherTypesModule,
    JournalEntriesModule,
    InvoiceLinesModule,
    AccountBalancesModule,
  ],
  providers: [RLSService, EncryptionService, RLSMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RLS middleware globally so that for each request we attempt to set
    // `app.current_tenant` from the authenticated user's companyId.
    // Note: auth middleware/guard must run earlier so `req.user` is available.
    consumer.apply(RLSMiddleware).forRoutes('*');
  }
}
