import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './config/database.config';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ItemsModule } from './modules/items/items.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { InvoiceItemsModule } from './modules/invoice-items/invoice-items.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ItemTemplatesModule } from './modules/item-templates/item-templates.module';
import { VatReportsModule } from './modules/vat-reports/vat-reports.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { CountriesModule } from './modules/countries/countries.module';
import { QrCodeModule } from './modules/qr-code/qr-code.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { PdfModule } from './modules/pdf/pdf.module';

// Common Services
import { RLSService } from './common/services/rls.service';
import { EncryptionService } from './common/services/encryption.service';

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
    CustomersModule,
    ItemsModule,
    InvoicesModule,
    InvoiceItemsModule,
    ReportsModule,
    DashboardModule,
    RolesModule,
    PermissionsModule,
    FileUploadModule,
    PdfModule,
    ItemTemplatesModule,
    VatReportsModule,
    AuditLogsModule,
    RolePermissionsModule,
    CountriesModule,
    QrCodeModule,
  ],
  providers: [RLSService, EncryptionService],
})
export class AppModule {}
